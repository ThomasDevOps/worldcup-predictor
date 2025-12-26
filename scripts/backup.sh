#!/bin/bash
set -e

# World Cup Predictor - Database Backup Script
# Usage: ./scripts/backup.sh [--full]

# Configuration (set via environment variables)
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Connection string
CONN="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo -e "${YELLOW}Starting backup at $(date)${NC}"
echo "Backup directory: $BACKUP_DIR"

# Test connection
echo -n "Testing database connection... "
if pg_isready -d "$CONN" -q; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "Could not connect to database. Check your credentials."
    exit 1
fi

# Full backup or critical only
if [ "$1" == "--full" ]; then
    echo -e "${YELLOW}Running FULL database backup...${NC}"

    pg_dump "$CONN" \
        --no-owner \
        --no-acl \
        -f "$BACKUP_DIR/full_${DATE}.sql"

    echo -e "${GREEN}Full backup saved: full_${DATE}.sql${NC}"
else
    # Backup critical user data (predictions + profiles)
    echo -n "Backing up predictions and profiles... "
    pg_dump "$CONN" \
        --no-owner \
        --no-acl \
        --data-only \
        -t public.predictions \
        -t public.profiles \
        -f "$BACKUP_DIR/critical_${DATE}.sql"
    echo -e "${GREEN}done${NC}"

    # Backup match data
    echo -n "Backing up matches... "
    pg_dump "$CONN" \
        --no-owner \
        --no-acl \
        --data-only \
        -t public.matches \
        -f "$BACKUP_DIR/matches_${DATE}.sql"
    echo -e "${GREEN}done${NC}"

    # Backup app config
    echo -n "Backing up app_config... "
    pg_dump "$CONN" \
        --no-owner \
        --no-acl \
        --data-only \
        -t public.app_config \
        -f "$BACKUP_DIR/config_${DATE}.sql" 2>/dev/null || echo -e "${YELLOW}skipped (table may not exist)${NC}"
fi

# Get row counts for verification
echo ""
echo -e "${YELLOW}Current row counts:${NC}"
psql "$CONN" -t -c "
SELECT 'profiles: ' || COUNT(*)::text FROM profiles
UNION ALL
SELECT 'predictions: ' || COUNT(*)::text FROM predictions
UNION ALL
SELECT 'matches: ' || COUNT(*)::text FROM matches
UNION ALL
SELECT 'finished matches: ' || COUNT(*)::text FROM matches WHERE status = 'finished';
" 2>/dev/null || echo "(Could not retrieve counts)"

# Compress old backups (older than 1 day)
echo ""
echo -n "Compressing old backups... "
find "$BACKUP_DIR" -name "*.sql" -mtime +1 -exec gzip {} \; 2>/dev/null
echo -e "${GREEN}done${NC}"

# Clean up very old backups (older than 30 days)
echo -n "Cleaning up backups older than 30 days... "
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete 2>/dev/null
echo -e "${GREEN}done${NC}"

# Summary
echo ""
echo -e "${GREEN}Backup complete!${NC}"
echo "Files created in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/*_${DATE}.sql 2>/dev/null || echo "(no files found)"
echo ""
echo "To restore, see: docs/BACKUP_RESTORE_PLAN.md"
