# World Cup 2026 Predictor - Claude Code Instructions

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
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Git
git status           # Check changes
git add -A && git commit -m "message"  # Commit all changes
git push             # Push to GitHub

# GitHub CLI
gh pr create         # Create pull request
gh issue create      # Create issue
```

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Page components (routes)
│   └── admin/       # Admin-only pages
├── hooks/           # Custom React hooks (useAuth, useMatches, etc.)
├── lib/             # Supabase client & database types
└── styles/          # Tailwind CSS

supabase/
└── migrations/      # Database migrations (schema + data)

prd/                 # Product Requirements Documents
.github/workflows/   # GitHub Actions CI/CD
```

## Key Files

- `src/lib/supabase.ts` - Supabase client initialization
- `src/lib/database.types.ts` - TypeScript types for database tables
- `src/hooks/useAuth.tsx` - Authentication context and hooks
- `src/App.tsx` - Main routing configuration
- `tailwind.config.js` - Custom color palette (dark theme)

## Code Style Guidelines

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Tailwind CSS utility classes (avoid inline styles)
- Follow existing component patterns in `src/components/`
- Custom colors defined in tailwind.config.js: `background`, `card`, `primary`, `success`, `warning`, `live`, `text-primary`, `text-secondary`

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

**Tables:**
- `profiles` - User profiles (display_name, total_points, is_admin)
- `teams` - World Cup teams (name, country_code, group_name)
- `matches` - Match fixtures (home/away teams, date, venue, scores, status)
- `predictions` - User predictions (predicted scores, points_earned)

**Match Status:** `scheduled` → `live` → `finished`

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

## Testing Instructions

1. Run `npm run dev` to start the dev server
2. Create a test account via the Register page
3. To test admin features, manually set `is_admin = true` in Supabase for your user

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migrations

**All database changes MUST be added as migration files in `supabase/migrations/`.**

**Naming convention:** `NNN_description.sql` (e.g., `005_add_user_avatars.sql`)

**Current migrations:**
- `001_initial_schema.sql` - Tables (profiles, teams, matches, predictions)
- `002_scoring_trigger.sql` - Points calculation trigger
- `003_row_level_security.sql` - RLS policies
- `004_seed_data.sql` - Teams & matches data (48 teams, 104 matches)

**Rules:**
- Never modify existing migrations that have been deployed
- Always create a new migration file for schema changes
- Migrations run automatically via GitHub Actions on push to main
- Test migrations locally before pushing

## Warnings

- Never commit `.env` file (contains secrets)
- Always run migrations in order (001, 002, 003, 004, ...)
- The `predictions` RLS policies depend on match kickoff time for visibility
- Database trigger handles point calculation - don't modify `points_earned` manually

## PRD Location

Full product requirements document: `prd/WorldCup2026_PRD.md`
