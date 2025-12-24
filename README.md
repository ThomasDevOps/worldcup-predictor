# World Cup 2026 Predictor

A web application where friends can predict FIFA World Cup 2026 match scores and compete on a leaderboard.

## Features

- User registration and authentication
- Match predictions with lockout at kickoff
- Prediction privacy until match starts
- Admin panel for entering final scores
- Automatic point calculation
- Real-time leaderboard updates
- Dark, modern UI

## Scoring System

| Result | Points |
|--------|--------|
| Exact Score | 10 points |
| Correct Winner | 5 points |
| Draw Bonus | +4 points |
| Wrong | 0 points |

Maximum points per match: **14** (exact draw score + draw bonus)

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Hosting:** Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/worldcup-predictor.git
   cd worldcup-predictor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project and run the migrations in `supabase/migrations/`

4. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The app is configured for deployment to Cloudflare Pages:

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Add environment variables in Cloudflare dashboard

## License

MIT
