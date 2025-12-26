#!/bin/bash
set -e

# World Cup Predictor - Database Restore Script
# Usage: ./scripts/restore.sh <backup_file.sql> [--recalculate]

# Configuration (set via environment variables)
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo ""
    echo "Usage: ./scripts/restore.sh <backup_file.sql> [--recalculate]"
    echo ""
    echo "Options:"
    echo "  --recalculate    Recalculate all points after restore"
    echo ""
    echo "Examples:"
    echo "  ./scripts/restore.sh backups/critical_20260615.sql"
    echo "  ./scripts/restore.sh backups/full_20260615.sql --recalculate"
    exit 1
fi

BACKUP_FILE="$1"
RECALCULATE=false

if [ "$2" == "--recalculate" ]; then
    RECALCULATE=true
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try unzipped version
    if [ -f "${BACKUP_FILE}.gz" ]; then
        echo "Found compressed backup, decompressing..."
        gunzip -k "${BACKUP_FILE}.gz"
    else
        echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
fi

# Check required environment variables
if [ -z "$PROJECT_REF" ] || [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Missing required environment variables${NC}"
    echo ""
    echo "Set the following environment variables:"
    echo "  export SUPABASE_PROJECT_REF=your-project-ref"
    echo "  export SUPABASE_DB_PASSWORD=your-db-password"
    echo ""
    echo "Find these in Supabase Dashboard → Settings → Database"
    exit 1
fi

# Connection string
CONN="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo -e "${YELLOW}=== World Cup Predictor Restore ===${NC}"
echo "Backup file: $BACKUP_FILE"
echo ""

# Test connection
echo -n "Testing database connection... "
if pg_isready -d "$CONN" -q; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Could not connect to database. Check your credentials."
    exit 1
fi

# Show current state before restore
echo ""
echo -e "${YELLOW}Current database state:${NC}"
psql "$CONN" -t -c "
SELECT 'profiles: ' || COUNT(*)::text FROM profiles
UNION ALL
SELECT 'predictions: ' || COUNT(*)::text FROM predictions
UNION ALL
SELECT 'matches: ' || COUNT(*)::text FROM matches;
" 2>/dev/null || echo "(Could not retrieve counts)"

# Confirmation
echo ""
echo -e "${RED}WARNING: This will restore data from the backup file.${NC}"
echo -e "${RED}Existing data may be overwritten.${NC}"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Disable triggers during restore for performance
echo ""
echo -n "Disabling triggers... "
psql "$CONN" -c "
ALTER TABLE predictions DISABLE TRIGGER ALL;
ALTER TABLE profiles DISABLE TRIGGER ALL;
ALTER TABLE matches DISABLE TRIGGER ALL;
" > /dev/null 2>&1
echo -e "${GREEN}done${NC}"

# Restore from backup
echo -n "Restoring from backup... "
psql "$CONN" -f "$BACKUP_FILE" > /dev/null 2>&1
RESTORE_STATUS=$?

if [ $RESTORE_STATUS -eq 0 ]; then
    echo -e "${GREEN}done${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Restore failed with exit code $RESTORE_STATUS"
    # Re-enable triggers even on failure
    psql "$CONN" -c "
    ALTER TABLE predictions ENABLE TRIGGER ALL;
    ALTER TABLE profiles ENABLE TRIGGER ALL;
    ALTER TABLE matches ENABLE TRIGGER ALL;
    " > /dev/null 2>&1
    exit 1
fi

# Re-enable triggers
echo -n "Re-enabling triggers... "
psql "$CONN" -c "
ALTER TABLE predictions ENABLE TRIGGER ALL;
ALTER TABLE profiles ENABLE TRIGGER ALL;
ALTER TABLE matches ENABLE TRIGGER ALL;
" > /dev/null 2>&1
echo -e "${GREEN}done${NC}"

# Recalculate points if requested
if [ "$RECALCULATE" = true ]; then
    echo ""
    echo -e "${YELLOW}Recalculating all points...${NC}"
    psql "$CONN" -c "SELECT * FROM recalculate_all_points();" 2>/dev/null || {
        echo -e "${RED}Warning: recalculate_all_points() function not found.${NC}"
        echo "Run migration 016_recalculate_points_function.sql first."
    }
fi

# Show state after restore
echo ""
echo -e "${GREEN}Restore complete!${NC}"
echo ""
echo -e "${YELLOW}Database state after restore:${NC}"
psql "$CONN" -t -c "
SELECT 'profiles: ' || COUNT(*)::text FROM profiles
UNION ALL
SELECT 'predictions: ' || COUNT(*)::text FROM predictions
UNION ALL
SELECT 'matches: ' || COUNT(*)::text FROM matches
UNION ALL
SELECT 'finished matches: ' || COUNT(*)::text FROM matches WHERE status = 'finished';
" 2>/dev/null || echo "(Could not retrieve counts)"

# Verify data integrity
echo ""
echo -e "${YELLOW}Verifying data integrity...${NC}"
ORPHANED=$(psql "$CONN" -t -c "
SELECT COUNT(*)
FROM predictions p
WHERE NOT EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = p.user_id);
" 2>/dev/null | tr -d ' ')

if [ "$ORPHANED" != "0" ] && [ -n "$ORPHANED" ]; then
    echo -e "${RED}Warning: Found $ORPHANED orphaned predictions${NC}"
else
    echo -e "${GREEN}No orphaned predictions found${NC}"
fi

POINTS_MISMATCH=$(psql "$CONN" -t -c "
SELECT COUNT(*)
FROM profiles p
WHERE p.total_points != COALESCE((
  SELECT SUM(points_earned) FROM predictions WHERE user_id = p.id
), 0);
" 2>/dev/null | tr -d ' ')

if [ "$POINTS_MISMATCH" != "0" ] && [ -n "$POINTS_MISMATCH" ]; then
    echo -e "${YELLOW}Warning: Found $POINTS_MISMATCH profiles with point mismatches${NC}"
    echo "Run: SELECT recalculate_all_points(); to fix"
else
    echo -e "${GREEN}All profile points are consistent${NC}"
fi

echo ""
echo "Restore completed at $(date)"
