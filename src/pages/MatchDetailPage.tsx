import { useParams, useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatches'
import { usePrediction, useMatchPredictions } from '../hooks/usePredictions'
import { PredictionForm } from '../components/PredictionForm'
import { PredictionsTable } from '../components/PredictionsTable'
import { TeamFlag } from '../components/TeamFlag'

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const { match, loading: matchLoading } = useMatch(matchId!)
  const { prediction, saving, savePrediction } = usePrediction(matchId!)
  const { predictions, loading: predictionsLoading } = useMatchPredictions(matchId!)

  if (matchLoading) {
    return (
      <div className="text-center py-12 text-text-secondary">Loading match...</div>
    )
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Match not found</p>
        <button onClick={() => navigate('/matches')} className="btn-primary">
          Back to Matches
        </button>
      </div>
    )
  }

  const matchDate = new Date(match.match_date)
  const isLocked = matchDate <= new Date()
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSavePrediction = async (homeScore: number, awayScore: number) => {
    await savePrediction(homeScore, awayScore)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-text-secondary hover:text-text-primary flex items-center gap-2"
      >
        <span>←</span> Back
      </button>

      {/* Match Header */}
      <div className="card">
        {/* Stage Badge */}
        <div className="flex justify-between items-center mb-6">
          <span className="badge bg-primary/20 text-primary">{match.stage}</span>
          {isLive && <span className="badge-live">LIVE</span>}
          {isFinished && <span className="badge-success">FINAL</span>}
          {isLocked && !isFinished && !isLive && (
            <span className="badge bg-warning/20 text-warning">LOCKED</span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center">
            <TeamFlag countryCode={match.home_team.country_code} size="xl" />
            <div className="text-lg font-semibold mt-3">{match.home_team.name}</div>
          </div>

          {/* Score / VS */}
          <div className="px-8 text-center">
            {isFinished || isLive ? (
              <div className="text-4xl font-bold">
                {match.home_score} - {match.away_score}
              </div>
            ) : (
              <div className="text-2xl text-text-secondary">vs</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center">
            <TeamFlag countryCode={match.away_team.country_code} size="xl" />
            <div className="text-lg font-semibold mt-3">{match.away_team.name}</div>
          </div>
        </div>

        {/* Match Info */}
        <div className="text-center text-text-secondary border-t border-text-secondary/10 pt-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span>📅</span>
            <span>{formatDate(matchDate)} • {formatTime(matchDate)}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>📍</span>
            <span>{match.venue}</span>
          </div>
        </div>
      </div>

      {/* Prediction Form (before lockout) */}
      {!isLocked && (
        <div className="card">
          <PredictionForm
            match={match}
            prediction={prediction}
            saving={saving}
            onSave={handleSavePrediction}
          />
        </div>
      )}

      {/* User's Prediction (after lockout, before showing all) */}
      {isLocked && prediction && !isFinished && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Your Prediction</h3>
          <div className="text-center text-2xl font-mono">
            {prediction.predicted_home_score} - {prediction.predicted_away_score}
          </div>
        </div>
      )}

      {/* All Predictions (after lockout) */}
      {isLocked && (
        <div className="card">
          {predictionsLoading ? (
            <div className="text-center py-8 text-text-secondary">
              Loading predictions...
            </div>
          ) : (
            <PredictionsTable predictions={predictions} match={match} />
          )}
        </div>
      )}
    </div>
  )
}
