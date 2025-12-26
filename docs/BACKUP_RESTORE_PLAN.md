# Backup & Restore Plan

This document outlines backup and restore procedures for the World Cup Predictor application.

## Data Classification

| Priority | Table | Data Type | Size Estimate | Can Regenerate? |
|----------|-------|-----------|---------------|-----------------|
| **CRITICAL** | `predictions` | User-generated | Users × 104 matches | NO |
| **CRITICAL** | `profiles` | User-generated | 1 per user | NO |
| **HIGH** | `matches` | Dynamic (scores) | 104 rows | Partially (via API) |
| **HIGH** | `app_config` | Configuration | 2-3 rows | Manual setup |
| **MEDIUM** | `teams` | Seed + dynamic | 112 rows | Partially (knockout TBD) |
| **LOW** | `match_sync_logs` | Audit logs | Variable | Not needed |

## Backup Strategies

### Option 1: Supabase Dashboard (Recommended for Production)

**Prerequisites:** Supabase Pro plan ($25/month)

1. Go to **Project Settings → Database → Backups**
2. Enable **Point-in-Time Recovery (PITR)** for granular recovery
3. Daily automatic backups retained for 7 days

**Restore via Dashboard:**
1. Go to Backups section
2. Select backup point
3. Click "Restore"

### Option 2: Manual SQL Exports (Free Tier Compatible)

#### Full Database Backup

```bash
# Export entire database
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  -f backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Critical Tables Only (Recommended)

```bash
# Export user predictions and profiles only
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  --data-only \
  -t public.predictions \
  -t public.profiles \
  -f predictions_backup_$(date +%Y%m%d).sql
```

#### Match Scores Backup

```bash
# Export match results
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  --data-only \
  -t public.matches \
  -f matches_backup_$(date +%Y%m%d).sql
```

### Option 3: Supabase CLI Export

```bash
# Export schema only (already in git migrations)
npx supabase db dump --schema-only -f schema.sql

# Export data only
npx supabase db dump --data-only -f data.sql

# Export specific tables
npx supabase db dump --data-only \
  --table public.predictions \
  --table public.profiles \
  -f critical_data.sql
```

### Option 4: SQL Copy Commands (In Supabase SQL Editor)

```sql
-- Export predictions to CSV (run in SQL Editor)
COPY (
  SELECT
    p.id,
    p.user_id,
    pr.display_name,
    p.match_id,
    p.predicted_home_score,
    p.predicted_away_score,
    p.points_earned,
    p.created_at,
    p.updated_at
  FROM predictions p
  JOIN profiles pr ON pr.id = p.user_id
) TO STDOUT WITH CSV HEADER;

-- Export profiles
COPY (
  SELECT id, display_name, total_points, is_admin, created_at
  FROM profiles
) TO STDOUT WITH CSV HEADER;
```

## Restore Procedures

### Scenario 1: Restore Predictions After Accidental Deletion

```sql
-- 1. Disable triggers temporarily
ALTER TABLE predictions DISABLE TRIGGER ALL;
ALTER TABLE profiles DISABLE TRIGGER ALL;

-- 2. Restore from backup file
\i predictions_backup_20260615.sql

-- 3. Re-enable triggers
ALTER TABLE predictions ENABLE TRIGGER ALL;
ALTER TABLE profiles ENABLE TRIGGER ALL;

-- 4. Recalculate all points (if needed)
SELECT recalculate_all_points();
```

### Scenario 2: Restore Single User's Predictions

```sql
-- From a backup, restore specific user's predictions
INSERT INTO predictions (
  id, user_id, match_id,
  predicted_home_score, predicted_away_score,
  points_earned, created_at, updated_at
)
SELECT
  id, user_id, match_id,
  predicted_home_score, predicted_away_score,
  points_earned, created_at, updated_at
FROM backup_predictions  -- temporary table with backup data
WHERE user_id = 'user-uuid-here'
ON CONFLICT (user_id, match_id) DO UPDATE SET
  predicted_home_score = EXCLUDED.predicted_home_score,
  predicted_away_score = EXCLUDED.predicted_away_score,
  points_earned = EXCLUDED.points_earned;
```

### Scenario 3: Full Database Restore

```bash
# 1. Stop all connections (via Supabase Dashboard → Database → Terminate)

# 2. Restore schema (migrations handle this)
npx supabase db reset

# 3. Restore data
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -f backup_20260615.sql

# 4. Verify data integrity
psql -c "SELECT COUNT(*) FROM predictions;"
psql -c "SELECT COUNT(*) FROM profiles;"
```

### Scenario 4: Rollback Bad Match Score

```sql
-- Use the built-in admin function
SELECT reset_match_to_scheduled('match-uuid-here');

-- This will:
-- 1. Reset match status to 'scheduled'
-- 2. Clear home_score and away_score
-- 3. Reset all prediction points_earned to NULL
-- 4. Recalculate user total_points
```

### Scenario 5: Recalculate All Points

```sql
-- Create helper function if not exists
CREATE OR REPLACE FUNCTION recalculate_all_points()
RETURNS void AS $$
DECLARE
  match_record RECORD;
BEGIN
  -- Reset all points
  UPDATE predictions SET points_earned = NULL;
  UPDATE profiles SET total_points = 0;

  -- Recalculate for each finished match
  FOR match_record IN
    SELECT id FROM matches WHERE status = 'finished'
  LOOP
    -- Trigger recalculation by updating match
    UPDATE matches
    SET updated_at = NOW()
    WHERE id = match_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run recalculation
SELECT recalculate_all_points();
```

## Backup Schedule Recommendations

| Tournament Phase | Frequency | What to Backup |
|------------------|-----------|----------------|
| Pre-tournament | Once | Full database snapshot |
| Group stage | Daily | predictions, profiles, matches |
| After each matchday | Immediately | predictions, matches |
| Knockout stage | After each match | predictions, matches |
| Finals weekend | Hourly | Full database |
| Post-tournament | Final backup | Full database (archive) |

## Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash
set -e

# Configuration
PROJECT_REF="your-project-ref"
DB_PASSWORD="your-db-password"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Connection string
CONN="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

# Backup critical tables
echo "Backing up predictions and profiles..."
pg_dump "$CONN" \
  --no-owner \
  --no-acl \
  --data-only \
  -t public.predictions \
  -t public.profiles \
  -f "$BACKUP_DIR/critical_${DATE}.sql"

# Backup match data
echo "Backing up matches..."
pg_dump "$CONN" \
  --no-owner \
  --no-acl \
  --data-only \
  -t public.matches \
  -f "$BACKUP_DIR/matches_${DATE}.sql"

# Compress backups older than 1 day
find "$BACKUP_DIR" -name "*.sql" -mtime +1 -exec gzip {} \;

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backup complete: $BACKUP_DIR/critical_${DATE}.sql"
```

## Quick Reference: Connection Strings

**Production:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Local Development:**
```
postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Verification Queries

After any restore, run these checks:

```sql
-- Check row counts
SELECT 'profiles' as table_name, COUNT(*) as rows FROM profiles
UNION ALL
SELECT 'predictions', COUNT(*) FROM predictions
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'teams', COUNT(*) FROM teams;

-- Verify points consistency
SELECT
  p.display_name,
  p.total_points as stored_points,
  COALESCE(SUM(pr.points_earned), 0) as calculated_points,
  p.total_points - COALESCE(SUM(pr.points_earned), 0) as difference
FROM profiles p
LEFT JOIN predictions pr ON pr.user_id = p.id
GROUP BY p.id, p.display_name, p.total_points
HAVING p.total_points != COALESCE(SUM(pr.points_earned), 0);

-- Check for orphaned predictions
SELECT COUNT(*) as orphaned_predictions
FROM predictions p
WHERE NOT EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = p.user_id);

-- Verify match integrity
SELECT COUNT(*) as matches_with_scores
FROM matches
WHERE status = 'finished' AND (home_score IS NULL OR away_score IS NULL);
```

## Emergency Contacts

- **Supabase Support:** support.supabase.com (Pro plan)
- **Database Password:** Supabase Dashboard → Settings → Database
- **Project Reference:** Found in project URL (e.g., `abcd1234` from `abcd1234.supabase.co`)

## Related Documentation

- [Supabase Backups](https://supabase.com/docs/guides/platform/backups)
- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- Database migrations: `supabase/migrations/`
