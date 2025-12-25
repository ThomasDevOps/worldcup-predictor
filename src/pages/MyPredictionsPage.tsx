import { Link } from 'react-router-dom'
import { useUserPredictions } from '../hooks/usePredictions'

export function MyPredictionsPage() {
  const { predictions, loading } = useUserPredictions()

  const getPointsIndicator = (points: number | null) => {
    if (points === null) return null

    if (points >= 10) {
      return { emoji: '🎯', label: 'Exact!', color: 'text-success' }
    } else if (points >= 5) {
      return { emoji: '✓', label: 'Winner', color: 'text-success' }
    } else {
      return { emoji: '✗', label: 'Wrong', color: 'text-text-secondary' }
    }
  }

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points_earned ?? 0), 0)
  const finishedPredictions = predictions.filter((p) => p.points_earned !== null)
  const exactPredictions = finishedPredictions.filter((p) => p.points_earned && p.points_earned >= 10).length
  const correctPredictions = finishedPredictions.filter((p) => p.points_earned && p.points_earned >= 5).length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Predictions</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Total Points</div>
          <div className="text-2xl font-bold text-primary">{totalPoints}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Predictions</div>
          <div className="text-2xl font-bold">{predictions.length}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Exact Scores</div>
          <div className="text-2xl font-bold text-success">{exactPredictions}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Correct Winners</div>
          <div className="text-2xl font-bold">{correctPredictions}</div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-background/50">
            <tr className="text-left text-sm text-text-secondary">
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3 text-center">Your Prediction</th>
              <th className="px-4 py-3 text-center">Result</th>
              <th className="px-4 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-text-secondary/10">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-secondary">
                  Loading predictions...
                </td>
              </tr>
            ) : predictions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-secondary">
                  You haven't made any predictions yet.{' '}
                  <Link to="/matches" className="text-primary hover:underline">
                    Browse matches
                  </Link>
                </td>
              </tr>
            ) : (
              predictions.map((prediction) => {
                const match = prediction.match
                const indicator = getPointsIndicator(prediction.points_earned)
                const isFinished = match.status === 'finished'

                return (
                  <tr key={prediction.id} className="hover:bg-card/50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/matches/${match.id}`}
                        className="hover:text-primary"
                      >
                        <div className="font-medium">
                          {match.home_team.name} vs {match.away_team.name}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {match.stage} •{' '}
                          {new Date(match.match_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center font-mono whitespace-nowrap">
                      {prediction.predicted_home_score} - {prediction.predicted_away_score}
                    </td>
                    <td className="px-4 py-3 text-center font-mono whitespace-nowrap">
                      {isFinished ? (
                        `${match.home_score} - ${match.away_score}`
                      ) : (
                        <span className="text-text-secondary">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {prediction.points_earned !== null ? (
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-bold ${
                              prediction.points_earned > 0 ? 'text-success' : 'text-text-secondary'
                            }`}
                          >
                            +{prediction.points_earned}
                          </span>
                          {indicator && (
                            <span className={`text-sm ${indicator.color}`}>
                              {indicator.emoji}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-secondary">-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
