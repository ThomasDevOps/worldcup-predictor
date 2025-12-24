import { useAuth } from '../hooks/useAuth'
import { useLeaderboard } from '../hooks/useLeaderboard'

export function LeaderboardPage() {
  const { profile } = useAuth()
  const { profiles, loading } = useLeaderboard()

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇'
      case 1:
        return '🥈'
      case 2:
        return '🥉'
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-background/50">
            <tr className="text-left text-sm text-text-secondary">
              <th className="px-4 py-3 w-16">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-text-secondary/10">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-text-secondary">
                  Loading leaderboard...
                </td>
              </tr>
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-text-secondary">
                  No players yet
                </td>
              </tr>
            ) : (
              profiles.map((p, index) => {
                const isCurrentUser = p.id === profile?.id
                const medal = getMedalEmoji(index)

                return (
                  <tr
                    key={p.id}
                    className={isCurrentUser ? 'bg-primary/5' : ''}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {medal ? (
                          <span className="text-xl">{medal}</span>
                        ) : (
                          <span className="text-text-secondary">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={isCurrentUser ? 'font-semibold text-primary' : ''}>
                        {p.display_name}
                      </span>
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-text-secondary">(You)</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-xl font-bold">{p.total_points}</span>
                      <span className="text-text-secondary ml-1">pts</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Scoring Explanation */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Scoring System</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">🎯 Exact Score</span>
            <span className="font-semibold">10 points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">✅ Correct Winner</span>
            <span className="font-semibold">5 points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">⭐ Draw Bonus</span>
            <span className="font-semibold">+4 points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">❌ Wrong Prediction</span>
            <span className="font-semibold">0 points</span>
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-4">
          Maximum points per match: 14 (exact draw score + draw bonus)
        </p>
      </div>
    </div>
  )
}
