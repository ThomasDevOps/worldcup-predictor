import { Link } from 'react-router-dom'
import { useMatches } from '../../hooks/useMatches'
import { useLeaderboard } from '../../hooks/useLeaderboard'

export function AdminDashboardPage() {
  const { matches } = useMatches()
  const { profiles } = useLeaderboard()

  const scheduledMatches = matches.filter((m) => m.status === 'scheduled').length
  const liveMatches = matches.filter((m) => m.status === 'live').length
  const finishedMatches = matches.filter((m) => m.status === 'finished').length

  // Matches that need results (live or recently finished without scores)
  const matchesNeedingResults = matches.filter(
    (m) => m.status === 'live' || (m.status === 'scheduled' && new Date(m.match_date) < new Date())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-warning">⚙️</span>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Total Players</div>
          <div className="text-2xl font-bold">{profiles.length}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Scheduled</div>
          <div className="text-2xl font-bold">{scheduledMatches}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Live</div>
          <div className="text-2xl font-bold text-live">{liveMatches}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Finished</div>
          <div className="text-2xl font-bold text-success">{finishedMatches}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/results" className="btn-primary">
            Enter Match Results
          </Link>
          <Link to="/matches" className="btn-secondary">
            View All Matches
          </Link>
          <Link to="/leaderboard" className="btn-secondary">
            View Leaderboard
          </Link>
        </div>
      </div>

      {/* Matches Needing Results */}
      {matchesNeedingResults.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-warning">⚠️</span>
            Matches Needing Results
          </h2>
          <div className="space-y-2">
            {matchesNeedingResults.slice(0, 5).map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {match.home_team.name} vs {match.away_team.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {new Date(match.match_date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <Link
                  to="/admin/results"
                  className="text-primary text-sm hover:underline"
                >
                  Enter Result →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
