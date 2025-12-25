import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useMatches'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { MatchCard } from '../components/MatchCard'

export function DashboardPage() {
  const { profile } = useAuth()
  const { matches, loading: matchesLoading } = useMatches()
  const { profiles, loading: leaderboardLoading } = useLeaderboard()

  // Get upcoming matches (next 3)
  const upcomingMatches = matches
    .filter((m) => m.status === 'scheduled')
    .slice(0, 3)

  // Get user's rank
  const userRank = profiles.findIndex((p) => p.id === profile?.id) + 1

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.display_name}!</h1>
        <p className="text-text-secondary">Here's your prediction overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Your Points</div>
          <div className="text-3xl font-bold text-primary">{profile?.total_points ?? 0}</div>
        </div>

        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Your Rank</div>
          <div className="text-3xl font-bold">
            {leaderboardLoading ? '-' : userRank > 0 ? `#${userRank}` : '-'}
          </div>
        </div>

        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Total Players</div>
          <div className="text-3xl font-bold">{profiles.length}</div>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Matches</h2>
          <Link to="/matches" className="text-primary text-sm hover:underline">
            View all
          </Link>
        </div>

        {matchesLoading ? (
          <div className="text-center py-8 text-text-secondary">Loading matches...</div>
        ) : upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="card text-center text-text-secondary">
            No upcoming matches
          </div>
        )}
      </div>

      {/* Leaderboard Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Top Players</h2>
          <Link to="/leaderboard" className="text-primary text-sm hover:underline">
            View full leaderboard
          </Link>
        </div>

        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-background/50">
              <tr className="text-left text-sm text-text-secondary">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text-secondary/10">
              {leaderboardLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-text-secondary">
                    Loading...
                  </td>
                </tr>
              ) : (
                profiles.slice(0, 5).map((p, index) => (
                  <tr
                    key={p.id}
                    className={p.id === profile?.id ? 'bg-primary/5' : ''}
                  >
                    <td className="px-4 py-3">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.id === profile?.id ? 'font-semibold text-primary' : ''}>
                        {p.display_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{p.total_points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
