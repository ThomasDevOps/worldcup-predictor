import { useState, useEffect } from 'react'
import type { MatchWithTeams, Prediction } from '../lib/database.types'

interface PredictionFormProps {
  match: MatchWithTeams
  prediction: Prediction | null
  saving: boolean
  onSave: (homeScore: number, awayScore: number) => Promise<void>
}

export function PredictionForm({ match, prediction, saving, onSave }: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState<string>('')
  const [awayScore, setAwayScore] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const matchDate = new Date(match.match_date)
  const isPastKickoff = matchDate <= new Date()
  const isLocked = isPastKickoff || match.status === 'finished'

  useEffect(() => {
    if (prediction) {
      setHomeScore(prediction.predicted_home_score.toString())
      setAwayScore(prediction.predicted_away_score.toString())
    }
  }, [prediction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const home = parseInt(homeScore, 10)
    const away = parseInt(awayScore, 10)

    if (isNaN(home) || isNaN(away)) {
      setError('Please enter valid scores')
      return
    }

    if (home < 0 || home > 99 || away < 0 || away > 99) {
      setError('Scores must be between 0 and 99')
      return
    }

    await onSave(home, away)
  }

  if (isLocked) {
    return (
      <div className="text-center text-text-secondary">
        <div className="text-lg mb-2">Predictions are locked</div>
        {prediction && (
          <div className="text-sm">
            Your prediction: {prediction.predicted_home_score} - {prediction.predicted_away_score}
          </div>
        )}
      </div>
    )
  }

  // Calculate time until lockout
  const timeUntilLock = matchDate.getTime() - new Date().getTime()
  const hoursUntilLock = Math.floor(timeUntilLock / (1000 * 60 * 60))
  const minutesUntilLock = Math.floor((timeUntilLock % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Your Prediction</h3>

      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-sm text-text-secondary mb-2">{match.home_team.name}</div>
          <input
            type="number"
            min="0"
            max="99"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="input w-20 text-center text-2xl"
            placeholder="0"
          />
        </div>

        <span className="text-2xl text-text-secondary">-</span>

        <div className="text-center">
          <div className="text-sm text-text-secondary mb-2">{match.away_team.name}</div>
          <input
            type="number"
            min="0"
            max="99"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="input w-20 text-center text-2xl"
            placeholder="0"
          />
        </div>
      </div>

      {error && <p className="text-live text-center text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary w-full disabled:opacity-50"
      >
        {saving ? 'Saving...' : prediction ? 'Update Prediction' : 'Save Prediction'}
      </button>

      <p className="text-sm text-text-secondary text-center">
        Predictions close in {hoursUntilLock}h {minutesUntilLock}m
      </p>
    </form>
  )
}
