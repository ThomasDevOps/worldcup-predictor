# World Cup 2026 Prediction Website
## Product Requirements Document (PRD)

| | |
|---|---|
| **Version** | 2.5 |
| **Date** | December 2024 |
| **Author** | Thomas |
| **Status** | Draft |

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2024 | Initial draft with automated Flashscore scraping |
| 2.0 | December 2024 | Simplified to manual score entry, added admin page, removed Railway scraper |
| 2.1 | December 2024 | Converted to Markdown, added prediction visibility rules |
| 2.2 | December 2024 | Changed hosting from Vercel to Cloudflare Pages, added custom domain option |
| 2.3 | December 2024 | Removed custom domain (not needed for hobby project), simplified to €0 cost |
| 2.4 | December 2024 | Added match page design with predictions table showing all users' predictions and points |
| 2.5 | December 2024 | Updated scoring system: 10 pts exact, 5 pts correct winner, +4 pts draw bonus |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Goals](#2-project-goals)
3. [Technology Stack](#3-technology-stack)
4. [Cost Analysis](#4-cost-analysis)
5. [Scoring System](#5-scoring-system)
6. [Admin Functionality](#6-admin-functionality)
7. [Database Schema](#7-database-schema)
8. [UI Design](#8-ui-design)
9. [Pages & Navigation](#9-pages--navigation)
10. [Responsive Design](#10-responsive-design)
11. [Business Rules](#11-business-rules)
12. [Phased Development Plan](#12-phased-development-plan)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Testing Strategy](#14-testing-strategy)
15. [Risks & Mitigations](#15-risks--mitigations)

---

## 1. Executive Summary

A web application where friends can predict FIFA World Cup 2026 match scores and compete on a leaderboard. Users earn points based on prediction accuracy: 3 points for exact score, 1 point for correct winner, 0 points otherwise.

The admin (Thomas) will manually enter final match results through a dedicated admin page. When a result is saved, the system automatically calculates points for all users and updates the leaderboard in real-time.

**Key Features:**
- User registration and authentication
- Match predictions with 15-minute lockout before kickoff
- Prediction privacy until lockout (users can't see others' predictions until window closes)
- Admin panel for entering final scores
- Automatic point calculation via database triggers
- Real-time leaderboard updates
- Dark, modern UI inspired by sports apps

---

## 2. Project Goals

- ✅ Create a simple, fun prediction game for friends
- ✅ Enable users to predict match scores before kickoff
- ✅ Keep predictions private until the prediction window closes
- ✅ Provide admin interface to manually enter final scores
- ✅ Automatically calculate and display real-time rankings
- ✅ Keep hosting costs at zero (completely free)
- ✅ Support both desktop and mobile devices
- ✅ Modern dark UI design inspired by sports betting apps

---

## 3. Technology Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React + Vite | Fast build tool, simple setup |
| Styling | Tailwind CSS | Utility-first, dark theme support |
| Database | Supabase (PostgreSQL) | Free tier, includes triggers |
| Authentication | Supabase Auth | Email/password login |
| Realtime Updates | Supabase Realtime | Live leaderboard updates |
| Frontend Hosting | Cloudflare Pages | Free tier, unlimited bandwidth, global CDN |
| Code Repository | GitHub | Version control + CI/CD trigger |

---

## 4. Cost Analysis

By using manual score entry and Cloudflare Pages free tier, the project is completely free to run.

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Free (500MB, 50K users) | €0 |
| Cloudflare Pages | Free (unlimited bandwidth) | €0 |
| GitHub | Free | €0 |
| **TOTAL** | | **€0** ✅ |

### Why Cloudflare Pages?

- ✅ **Unlimited bandwidth** - No surprise bills
- ✅ **Global CDN** - Fast loading everywhere
- ✅ **Auto-deploy from GitHub** - Push to main = live
- ✅ **Preview deployments** - Every PR gets a unique URL
- ✅ **Free SSL** - HTTPS included
- ✅ **No cold starts** - Always fast

Your app will be available at: `https://worldcup-predictor.pages.dev`

---

## 5. Scoring System

### 5.1 Points Overview

| Prediction Result | Points | Description |
|-------------------|--------|-------------|
| 🎯 Exact Score | **10 points** | You predict the exact final score |
| ✅ Correct Winner | **5 points** | You correctly predict which team wins (or draw) |
| ⭐ Draw Bonus | **+4 points** | Extra reward for correctly predicting a draw |
| ❌ Wrong Prediction | **0 points** | Wrong winner, no points |

### 5.2 Calculation Examples

| Your Prediction | Actual Result | Points Breakdown | Total |
|-----------------|---------------|------------------|-------|
| 2-1 | 2-1 | Exact Score (10) | **10** |
| 3-1 | 2-0 | Correct Winner (5) | **5** |
| 1-1 | 1-1 | Exact Score (10) + Draw Bonus (4) | **14** |
| 2-2 | 1-1 | Correct Winner/Draw (5) + Draw Bonus (4) | **9** |
| 0-0 | 2-2 | Correct Winner/Draw (5) + Draw Bonus (4) | **9** |
| 3-0 | 0-2 | Wrong winner | **0** |

### 5.3 Important Notes

- **Draw Bonus stacks** - If you predict a draw and the match is a draw, you get the draw bonus (+4) on top of either exact score (10) or correct outcome (5)
- **Extra time and penalties** count as final score
- **No prediction submitted** = 0 points (no penalty)

### 5.4 Strategy Tip

> 💡 Correctly predicting draws gives you a significant advantage due to the bonus points! A correct exact draw score (e.g., 1-1 → 1-1) earns you 14 points - the maximum possible.

---

## 6. Admin Functionality

### 6.1 Admin Role

Thomas is the sole admin of the application. The admin can participate in predictions like any other user but has additional access to enter final match results through a dedicated admin page.

### 6.2 Admin Page Features

- View list of all matches (filterable by status: scheduled, live, finished)
- Enter final score for any match
- Mark match as 'live' when it starts (optional, for UI indication)
- Edit scores if mistakes were made (triggers automatic recalculation)
- View prediction statistics per match

### 6.3 Points Recalculation Flow

When the admin saves a final match result:

```
1. Admin enters final score (e.g., Belgium 2-1 Canada)
              ↓
2. Database updates match: status = 'finished'
              ↓
3. Database trigger fires automatically
              ↓
4. Trigger calculates points for ALL predictions on that match:
   • Jan:    Predicted 2-1 → Exact match!    → 3 points
   • Pieter: Predicted 1-0 → Correct winner  → 1 point
   • Marie:  Predicted 0-2 → Wrong           → 0 points
              ↓
5. Trigger updates total_points for all affected users
              ↓
6. Supabase Realtime broadcasts changes
              ↓
7. Leaderboard updates instantly in all browsers
```

### 6.4 Database Trigger

A PostgreSQL trigger function handles all point calculations automatically:

- Fires when match status changes to 'finished'
- Calculates points (0, 1, or 3) for each prediction using `SIGN()` comparison
- Updates `predictions.points_earned` for all predictions on that match
- Recalculates `profiles.total_points` as SUM of all user's earned points

---

## 7. Database Schema

### 7.1 Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profiles with display_name, total_points, and is_admin flag |
| `teams` | All 48 World Cup teams with name, country_code, flag_url, group_name |
| `matches` | All 104 matches with team IDs, match_date, stage, venue, scores, status |
| `predictions` | User predictions with user_id, match_id, predicted scores, points_earned |

### 7.2 Key Fields

| Field | Description |
|-------|-------------|
| `profiles.is_admin` | Boolean flag to identify admin users. Only admins can access /admin routes |
| `matches.status` | Enum: 'scheduled', 'live', 'finished' - controls UI display and prediction lockout |
| `predictions.points_earned` | NULL until match finishes, then auto-calculated by trigger (0, 1, or 3) |

### 7.3 Row Level Security (RLS)

| Rule | Description |
|------|-------------|
| Own predictions | Users can only INSERT/UPDATE their own predictions |
| Prediction visibility | Users can only see OTHER users' predictions after prediction window closes (15 min before kickoff) |
| Profiles | Users can read all profiles (for leaderboard) |
| Matches & Teams | Users can read all matches and teams |
| Admin only | Only admin can UPDATE matches (to enter scores) |

---

## 8. UI Design

### 8.1 Design Style

The design is inspired by modern sports betting apps:

- Dark navy/purple background with gradient accents
- Card-based layout for matches
- Team logos/flags prominently displayed
- Colored pills for categories (Group A, Round of 16, etc.)
- High contrast text for readability
- Rounded corners on all interactive elements
- Mobile-first responsive design

### 8.2 Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| Background | Dark Navy | `#0F172A` |
| Card Background | Slate | `#1E293B` |
| Primary Accent | Cyan/Teal | `#06B6D4` |
| Success | Green | `#22C55E` |
| Warning | Yellow | `#EAB308` |
| Live Indicator | Red | `#EF4444` |
| Text Primary | White | `#FFFFFF` |
| Text Secondary | Gray | `#94A3B8` |

---

## 9. Pages & Navigation

### 9.1 Public Pages (No Auth Required)

| Page | Description |
|------|-------------|
| Login | Clean authentication form with email/password |
| Register | Sign up form with email, password, and display name |

### 9.2 Authenticated Pages

| Page | Description |
|------|-------------|
| Dashboard | Overview: upcoming matches, recent predictions, current ranking position |
| Matches | Card list of all matches with filter pills, prediction inputs |
| Match Detail | Full match info, prediction form (if open), all predictions table (after lockout) |
| Leaderboard | Rankings table with position, name, total points, stats |
| My Predictions | History of all user's predictions with points earned |
| Profile | User settings, edit display name, logout |

### 9.4 Match Detail Page Layout

The match detail page shows different content based on match status:

**Before Lockout (predictions open):**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                    Group A          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         🇧🇪                           🇨🇦                    │
│       Belgium                       Canada                  │
│                                                             │
│              ⏰ June 15, 2026 • 18:00                       │
│              📍 MetLife Stadium, New York                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Your Prediction                                            │
│  ┌─────────┐         ┌─────────┐                           │
│  │    2    │    -    │    1    │                           │
│  └─────────┘         └─────────┘                           │
│                                                             │
│  [ Save Prediction ]                                        │
│                                                             │
│  ⏳ Predictions close in 2h 15m                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**After Lockout / During Match / After Match:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                    Group A          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         🇧🇪                           🇨🇦                    │
│       Belgium         2 - 1         Canada                  │
│                    ✅ FINAL                                 │
│                                                             │
│              📅 June 15, 2026 • 18:00                       │
│              📍 MetLife Stadium, New York                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👥 Predictions                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Player        Prediction      Points                │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🥇 Thomas      2 - 1          +3 🎯 Exact!          │   │
│  │ 🥈 Jan         2 - 0          +1 ✓ Winner           │   │
│  │ 🥉 Pieter      1 - 1          +0 ✗ Wrong            │   │
│  │    Marie       3 - 1          +1 ✓ Winner           │   │
│  │    Sophie      0 - 2          +0 ✗ Wrong            │   │
│  │    Kevin       -              +0 No prediction      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 Stats: 1 exact • 2 correct winner • 2 wrong            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**

| Element | Description |
|---------|-------------|
| Final Score | Large, prominent display of actual match result |
| Status Badge | Shows 🔴 LIVE, ✅ FINAL, or 🔒 LOCKED |
| Predictions Table | All users' predictions, sorted by points earned |
| Points Column | Shows points with visual indicator (🎯 exact, ✓ winner, ✗ wrong) |
| Medal Icons | Top 3 scorers for this match get 🥇🥈🥉 |
| Stats Summary | Quick overview of prediction accuracy |
| Your Row | Highlighted with different background color |

### 9.3 Admin Pages

| Page | Description |
|------|-------------|
| Admin Dashboard | Overview of matches needing results, recent activity |
| Enter Results | List of matches with forms to input final scores |
| Manage Users | View all users and their prediction counts |

---

## 10. Responsive Design

| Breakpoint | Layout |
|------------|--------|
| **Mobile** (< 640px) | Single column, bottom navigation, touch-friendly inputs (min 44px tap targets) |
| **Tablet** (640px - 1024px) | Two column grid for match cards |
| **Desktop** (> 1024px) | Sidebar navigation, three column grid for match cards |

---

## 11. Business Rules

### 11.1 Prediction Rules

| Rule | Description |
|------|-------------|
| Timing | Users can only predict for matches with status = 'scheduled' |
| Lockout | Predictions lock **when the match starts** (kickoff time) |
| Editing | Users can edit their prediction unlimited times until kickoff |
| Limit | Only one prediction per user per match (upsert behavior) |
| Values | Score inputs accept values 0-99 |
| Admin | Admin (Thomas) can also submit predictions like any regular user |

### 11.2 Prediction Visibility Rules

| Status | What users can see |
|--------|-------------------|
| **Before match starts** | Users can ONLY see their own predictions |
| **After match starts** | All predictions for that match become visible to everyone |
| **Match finished** | All predictions visible + points earned shown |

This ensures fair play - no one can copy another user's prediction before kickoff!

### 11.3 Scoring Rules

| Rule | Description |
|------|-------------|
| Trigger | Points calculated only when admin marks match as 'finished' |
| Exact score | 10 points |
| Correct outcome | 5 points (home win / away win / draw) |
| Draw bonus | +4 extra points if correctly predicted a draw |
| Wrong | 0 points |
| No prediction | 0 points (no penalty) |

**Maximum points per match:** 14 (exact draw score + draw bonus)

---

## 12. Phased Development Plan

### Phase 1: Foundation & Authentication

**Goal:** Users can register, login, and view their profile. Basic dark theme implemented.

- [ ] Set up Supabase project with database schema
- [ ] Create React + Vite project with Tailwind CSS (dark theme)
- [ ] Implement login/register pages with Supabase Auth
- [ ] Create user profile page with display name editing
- [ ] Set up row-level security (RLS) policies
- [ ] Add is_admin flag to profiles table
- [ ] Deploy frontend to Cloudflare Pages with GitHub integration

---

### Phase 2: Teams & Matches

**Goal:** Display all World Cup teams and match schedule with card-based UI.

- [ ] Seed database with all 48 World Cup 2026 teams
- [ ] Add team flags (country flag emoji or image URLs)
- [ ] Seed database with all 104 match fixtures
- [ ] Create match card component (dark theme, team logos, time)
- [ ] Create matches page with filter pills (Group A-L, Round of 16, etc.)
- [ ] Group matches by date in the list view

---

### Phase 3: Predictions

**Goal:** Users can submit and edit predictions before match kickoff.

- [ ] Add prediction inputs to match cards (home/away score)
- [ ] Implement lockout at match kickoff time
- [ ] Allow editing predictions until kickoff
- [ ] Show visual status: 'Predicted', 'Not predicted', 'Locked'
- [ ] Create 'My Predictions' page with history
- [ ] Add confirmation feedback when prediction is saved
- [ ] Implement prediction visibility rules (hide others' predictions until kickoff)

---

### Phase 4: Admin & Scoring

**Goal:** Admin can enter results, system auto-calculates points.

- [ ] Create admin route protection (check is_admin flag)
- [ ] Create admin dashboard page
- [ ] Create 'Enter Results' page with match list and score inputs
- [ ] Implement database trigger for automatic point calculation
- [ ] Show number of predictions affected when saving a result
- [ ] Add ability to edit previously entered scores (with recalculation)

---

### Phase 5: Leaderboard & Realtime

**Goal:** Live leaderboard that updates when admin enters results. Match detail pages show all predictions.

- [ ] Create leaderboard page with rankings table
- [ ] Implement Supabase Realtime subscription on profiles table
- [ ] Auto-update leaderboard when total_points changes
- [ ] Create match detail page with predictions table
- [ ] Show all users' predictions after kickoff (sorted by points)
- [ ] Display points earned per user with visual indicators (🎯 exact, ✓ winner, ✗ wrong)
- [ ] Highlight current user's row in predictions table
- [ ] Add match stats summary (X exact, Y correct winner, Z wrong)
- [ ] Add statistics: perfect predictions count, accuracy percentage
- [ ] Highlight position changes on leaderboard (up/down arrows)

---

### Future Phase: Automated Live Scores (Optional)

**Goal:** Automatically fetch live scores instead of manual entry.

> ⚠️ Only implement if desired later. Adds ~€3-5 cost for Railway hosting.

- [ ] Create Playwright scraper for Flashscore.com
- [ ] Host scraper on Railway with cron schedule
- [ ] Add team aliases for matching scraped names to database
- [ ] Implement smart scheduling (only scrape during live matches)
- [ ] Add virtual/live ranking during matches

---

## 13. Deployment Strategy

### 13.1 Repository Structure

```
worldcup-predictor/
├── src/                  # React application source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and Supabase client
│   └── styles/           # Global styles
├── supabase/
│   ├── migrations/       # Database migrations
│   └── seed.sql          # Seed data (teams, matches)
├── public/               # Static assets (team flags)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

### 13.2 Cloudflare Pages Setup

**Build Configuration:**

| Setting | Value |
|---------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

**Environment Variables (set in Cloudflare dashboard):**

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

### 13.3 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  Developer pushes code to feature branch                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Create Pull Request on GitHub                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Pages auto-builds preview deployment            │
│  → https://abc123.worldcup-predictor.pages.dev              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Review PR, test preview URL                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Merge PR to main branch                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloudflare Pages auto-deploys to production                │
│  → https://worldcup-predictor.pages.dev                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. Testing Strategy

Manual testing for initial launch, with optional Playwright E2E tests:

- [ ] Login/logout flows
- [ ] Prediction submission and editing
- [ ] Prediction lockout enforcement (at kickoff time)
- [ ] Prediction visibility (can't see others before kickoff)
- [ ] Admin score entry and point calculation
- [ ] Leaderboard ranking accuracy
- [ ] Mobile responsiveness (iOS Safari, Android Chrome)

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Admin forgets to enter score | Points not calculated | Add reminder notifications or checklist |
| Admin enters wrong score | Wrong points awarded | Allow score editing with automatic recalculation |
| Supabase free tier limits | Service throttling | Small user base, minimal data usage |
| User disputes scoring | Complaints | Show calculation logic transparently |
| Users try to see others' predictions | Unfair advantage | RLS policies enforce visibility rules |

---

## Appendix A: World Cup 2026 Facts

| Fact | Value |
|------|-------|
| Host countries | USA, Canada, Mexico |
| Number of teams | 48 (expanded from 32) |
| Total matches | 104 |
| Tournament duration | June 11 - July 19, 2026 (39 days) |
| Host cities | 16 cities across 3 countries |
| Group stage format | 12 groups of 4 teams |

---

## Appendix B: Points Calculation Logic

The database trigger calculates points using the following logic:

### Step 1: Calculate Base Points

```sql
-- Base points calculation
base_points = CASE
  -- Exact score = 10 points
  WHEN predicted_home = actual_home 
   AND predicted_away = actual_away 
  THEN 10
  
  -- Correct outcome = 5 points
  WHEN SIGN(predicted_home - predicted_away) = SIGN(actual_home - actual_away)
  THEN 5
  
  -- Wrong = 0 points
  ELSE 0
END
```

### Step 2: Calculate Draw Bonus

```sql
-- Draw bonus: +4 if correctly predicted a draw
draw_bonus = CASE
  WHEN actual_home = actual_away  -- Match was a draw
   AND SIGN(predicted_home - predicted_away) = 0  -- User predicted a draw
  THEN 4
  ELSE 0
END
```

### Step 3: Total Points

```sql
total_points = base_points + draw_bonus
```

### How SIGN() Works

The `SIGN()` function returns:
- `-1` for away win (home < away)
- `0` for draw (home = away)
- `1` for home win (home > away)

### Points Summary

| Scenario | Base | Bonus | Total |
|----------|------|-------|-------|
| Exact score (not draw) | 10 | 0 | **10** |
| Exact score (draw) | 10 | 4 | **14** |
| Correct winner | 5 | 0 | **5** |
| Correct draw (wrong score) | 5 | 4 | **9** |
| Wrong | 0 | 0 | **0** |

---

## Appendix C: Prediction Visibility Timeline

```
Match: Belgium vs Canada
Kickoff: 18:00

Timeline:
─────────────────────────────────────────────────────────────
  12:00                      18:00              20:00
    │                          │                  │
    ▼                          ▼                  ▼
 Predict                  ⚽ KICKOFF          🏁 FINAL
                          🔒 LOCKED
 
 ├─────────────────────────────┤                  │
 Users can predict             │                  │
 Only see OWN predictions      │                  │
                               │                  │
                               ├──────────────────┤
                               All predictions visible
                               Points shown after FINAL
─────────────────────────────────────────────────────────────
```

**What happens at each stage:**

| Time | Predictions | Visibility |
|------|-------------|------------|
| Before kickoff | ✅ Can submit/edit | Only own prediction |
| At kickoff | 🔒 Locked | Everyone's predictions visible |
| After match | 🔒 Locked | Everyone's predictions + points |
