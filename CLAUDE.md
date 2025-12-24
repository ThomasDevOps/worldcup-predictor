# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application for predicting FIFA World Cup 2026 match scores. Users compete on a leaderboard based on prediction accuracy.

**Tech Stack:**
- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS (dark theme)
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Hosting: Cloudflare Pages

## Common Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Architecture

**Frontend Structure:**
- `src/App.tsx` - React Router configuration with nested routes
- `src/hooks/` - Data fetching hooks (useAuth, useMatches, usePredictions, useLeaderboard)
- `src/components/` - Shared UI components (MatchCard, PredictionForm, Layout)
- `src/pages/` - Route components; admin pages under `pages/admin/`

**Data Flow:**
1. `AuthProvider` wraps app, provides user context via `useAuth` hook
2. `ProtectedRoute` and `AdminRoute` guard authenticated/admin pages
3. Data hooks fetch from Supabase and return typed data
4. Database triggers auto-calculate points when admin marks matches finished

**Database (Supabase):**
- Migrations in `supabase/migrations/` - run in numeric order (001, 002, 003)
- `seed.sql` contains all 48 teams and 104 match fixtures
- RLS policies control data access based on user role and match timing

## Code Style

- TypeScript strict mode with functional components
- Tailwind CSS utility classes - custom colors in `tailwind.config.js`: `background`, `card`, `primary`, `success`, `warning`, `live`, `text-primary`, `text-secondary`
- Follow existing component patterns in `src/components/`

## Commit Message Convention

**All commits MUST follow the Conventional Commits specification.**

Format: `<type>(<scope>): <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `build` - Build system or dependencies
- `ci` - CI/CD configuration
- `chore` - Other changes (e.g., updating .gitignore)

**Scope (optional):** Component or area affected (e.g., `auth`, `matches`, `admin`, `db`)

**Examples:**
```
feat(auth): add password reset functionality
fix(predictions): correct points calculation for draws
docs: update README with deployment instructions
refactor(hooks): simplify useMatches hook
ci: add Supabase migrations workflow
```

**Breaking changes:** Add `!` after type/scope: `feat(api)!: change response format`

## Database Schema

| Table | Key Fields |
|-------|------------|
| `profiles` | display_name, total_points, is_admin |
| `teams` | name, country_code, group_name |
| `matches` | home/away team IDs, date, venue, scores, status (`scheduled`→`live`→`finished`) |
| `predictions` | user_id, match_id, predicted_home/away_score, points_earned |

## Scoring System

| Result | Points |
|--------|--------|
| Exact Score | 10 pts |
| Correct Winner | 5 pts |
| Draw Bonus | +4 pts |
| Wrong | 0 pts |

Maximum per match: **14 points** (exact draw + bonus)

## Business Rules

- Predictions lock at match kickoff time
- Other users' predictions hidden until kickoff
- Points calculated automatically via database trigger when admin marks match as finished
- Only admin can enter/edit match results

## Environment Variables

Required in `.env` (see `.env.example`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Important Notes

- To test admin features, manually set `is_admin = true` in Supabase for your user
- Migrations must run in numeric order (001, 002, 003)
- RLS policies hide other users' predictions until match kickoff time
- Database trigger auto-calculates `points_earned` - don't modify manually
- Full product requirements: `prd/WorldCup2026_PRD.md`
