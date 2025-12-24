import type { PredictionWithUser, MatchWithTeams } from '../lib/database.types'
import { useAuth } from '../hooks/useAuth'

interface PredictionsTableProps {
  predictions: PredictionWithUser[]
  match: MatchWithTeams
}

export function PredictionsTable({ predictions, match }: PredictionsTableProps) {
  const { user } = useAuth()
  const isFinished = match.status === 'finished'

  const getMedalEmoji = (index: number) => {
    if (!isFinished) return null
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

  const getPointsIndicator = (prediction: PredictionWithUser) => {
    if (!isFinished || prediction.points_earned === null) return null

    if (prediction.points_earned >= 10) {
      return { emoji: '🎯', label: 'Exact!' }
    } else if (prediction.points_earned >= 5) {
      return { emoji: '✓', label: 'Winner' }
    } else {
      return { emoji: '✗', label: 'Wrong' }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <span>👥</span> Predictions
      </h3>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-background/50">
            <tr className="text-left text-sm text-text-secondary">
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-center">Prediction</th>
              {isFinished && <th className="px-4 py-3 text-right">Points</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-text-secondary/10">
            {predictions.length === 0 ? (
              <tr>
                <td colSpan={isFinished ? 3 : 2} className="px-4 py-8 text-center text-text-secondary">
                  No predictions yet
                </td>
              </tr>
            ) : (
              predictions.map((prediction, index) => {
                const isCurrentUser = prediction.user_id === user?.id
                const medal = getMedalEmoji(index)
                const indicator = getPointsIndicator(prediction)

                return (
                  <tr
                    key={prediction.id}
                    className={isCurrentUser ? 'bg-primary/5' : ''}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {medal && <span>{medal}</span>}
                        <span className={isCurrentUser ? 'font-semibold text-primary' : ''}>
                          {prediction.profile.display_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">
                      {prediction.predicted_home_score} - {prediction.predicted_away_score}
                    </td>
                    {isFinished && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-bold ${
                              prediction.points_earned && prediction.points_earned > 0
                                ? 'text-success'
                                : 'text-text-secondary'
                            }`}
                          >
                            +{prediction.points_earned ?? 0}
                          </span>
                          {indicator && (
                            <span className="text-sm text-text-secondary">
                              {indicator.emoji} {indicator.label}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {isFinished && predictions.length > 0 && (
        <div className="text-sm text-text-secondary text-center">
          📊 Stats:{' '}
          {predictions.filter((p) => p.points_earned && p.points_earned >= 10).length} exact •{' '}
          {predictions.filter((p) => p.points_earned && p.points_earned >= 5 && p.points_earned < 10).length} correct winner •{' '}
          {predictions.filter((p) => p.points_earned === 0).length} wrong
        </div>
      )}
    </div>
  )
}
