# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

World Cup 2026 prediction game where users predict match scores and compete on a leaderboard. Built with React + Vite + TypeScript, Supabase (PostgreSQL), and Tailwind CSS.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Build for production
npm run lint      # Run ESLint

# Local Database (requires Docker)
npm run db:start  # Start local Supabase (first run downloads images)
npm run db:stop   # Stop local Supabase containers
npm run db:reset  # Reset DB and run all migrations + seed
npm run db:studio # Open Supabase Studio (http://localhost:54323)
```

## Local Development Setup

**Prerequisites:** Docker Desktop must be installed and running.

**First-time setup:**
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop and wait for it to be running
3. Run `npx supabase init` (creates `supabase/config.toml`)
4. Run `npm run db:start` (downloads images on first run, takes a few minutes)
5. Run `npm run db:reset` to apply migrations and seed data
6. Create `.env.local` with the local URLs (shown in db:start output)

**Daily workflow:**
1. `npm run db:start` - Start local Supabase
2. `npm run dev` - Start Vite dev server
3. Open http://localhost:5173 - Test the app
4. Open http://localhost:54323 - Supabase Studio to inspect DB

## Architecture

### Frontend (React + TypeScript)

**Routing:** React Router in `src/App.tsx` with protected routes via `ProtectedRoute` and `AdminRoute` components.

**Auth Flow:** `useAuth` hook provides user/session state, wraps Supabase Auth. Profile data auto-fetched on login.

**Data Fetching:** Custom hooks in `src/hooks/` handle Supabase queries with realtime subscriptions:
- `useMatches` / `useMatch` - Match data with team joins
- `usePredictions` / `useMatchPredictions` - User predictions with realtime updates
- `useLeaderboard` - Rankings with realtime subscription on profiles table

### Database (Supabase PostgreSQL)

**Tables:** `profiles`, `teams`, `matches`, `predictions`

**Key Relationships:**
- `matches` → `teams` (home_team_id, away_team_id)
- `predictions` → `profiles` + `matches`

**Automatic Scoring:** Database trigger in `002_scoring_trigger.sql` calculates points when match status changes to 'finished'. Scoring: 10 pts exact, 5 pts correct winner, +4 pts draw bonus.

**RLS Policies:** Predictions hidden from other users until match kickoff time (enforced at database level in `003_row_level_security.sql`).

### Tailwind Theme

Custom dark theme colors in `tailwind.config.js`: `background`, `card`, `primary`, `success`, `warning`, `live`, `text-primary`, `text-secondary`

## Commit Convention

**Format:** `<type>(<scope>): <description>`

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**Scope:** `auth`, `matches`, `predictions`, `admin`, `db`, `ui`

## Database Migrations

**Location:** `supabase/migrations/`

**Naming:** `NNN_description.sql`

**Current:**
- `001_initial_schema.sql` - Tables
- `002_scoring_trigger.sql` - Points calculation
- `003_row_level_security.sql` - RLS policies
- `004_seed_data.sql` - 48 teams, 104 matches
- `008_scheduled_match_sync.sql` - Automatic match result sync via cron

**Rules:** Never modify deployed migrations. Create new files for changes. Migrations auto-run via GitHub Actions.

## Environment Variables

**Production (.env):**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Local Development (.env.local):**
```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

## Local Supabase URLs

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| Mailpit | http://127.0.0.1:54324 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

## Key Constraints

- Predictions lock at match kickoff (not 15 min before)
- Points calculated by DB trigger - never modify `points_earned` directly
- Admin flag (`is_admin`) must be set manually in Supabase after signup

## Automatic Match Result Sync

Matches are automatically synced from football-data.org API using an Edge Function + pg_cron.

### How It Works

1. **Edge Function** (`supabase/functions/sync-match-results/`) fetches World Cup matches from football-data.org
2. **pg_cron** calls the Edge Function on a schedule (when enabled)
3. Match scores are updated in the database
4. The scoring trigger automatically calculates prediction points

### Enable/Disable Sync (SQL Editor)

```sql
-- Enable sync every 10 minutes
SELECT toggle_match_sync(true, 10);

-- Enable sync every 5 minutes (during active matches)
SELECT toggle_match_sync(true, 5);

-- Disable sync
SELECT toggle_match_sync(false);

-- Check current cron jobs
SELECT * FROM cron.job;

-- View sync history
SELECT * FROM match_sync_logs ORDER BY started_at DESC LIMIT 10;
```

### Manual Sync (One-Time)

**Production:**
```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-match-results" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Local:**
```bash
# Start Edge Functions first
npx supabase functions serve --env-file supabase/.env.local

# Then trigger sync
curl -X POST "http://127.0.0.1:54321/functions/v1/sync-match-results" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json"
```

### Test Mode (Premier League)

Test the API integration using Premier League data (without updating DB):

```bash
curl -X POST "http://127.0.0.1:54321/functions/v1/sync-match-results" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{"testMode": true}'
```

### Dry Run Mode

See what would be updated without making changes:

```bash
curl -X POST "..." -d '{"dryRun": true}'
```

### API Key

The `FOOTBALL_DATA_API_KEY` must be set in Supabase Edge Function secrets (Dashboard → Project Settings → Edge Functions → Secrets).

Free tier: 10 requests/minute. Get key at: https://www.football-data.org/client/register

## PRD

Full requirements: `prd/WorldCup2026_PRD.md`
