import { Link } from 'react-router-dom'
import type { MatchWithTeams } from '../lib/database.types'

interface MatchCardProps {
  match: MatchWithTeams
  userPrediction?: {
    predicted_home_score: number
    predicted_away_score: number
    points_earned: number | null
  } | null
}

export function MatchCard({ match, userPrediction }: MatchCardProps) {
  const matchDate = new Date(match.match_date)
  const isLocked = matchDate <= new Date()
  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <Link to={`/matches/${match.id}`} className="block">
      <div className="card hover:bg-card/80 transition-colors">
        {/* Stage Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className="badge bg-primary/20 text-primary">{match.stage}</span>
          {isLive && <span className="badge-live">LIVE</span>}
          {isFinished && <span className="badge-success">FINAL</span>}
          {!isLocked && !isFinished && !isLive && (
            <span className="badge bg-text-secondary/20 text-text-secondary">
              Predictions Open
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="text-2xl mb-1">{match.home_team.country_code}</div>
            <div className="text-sm text-text-secondary">{match.home_team.name}</div>
          </div>

          {/* Score / VS */}
          <div className="px-4">
            {isFinished || isLive ? (
              <div className="text-2xl font-bold">
                {match.home_score} - {match.away_score}
              </div>
            ) : (
              <div className="text-text-secondary">vs</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="text-2xl mb-1">{match.away_team.country_code}</div>
            <div className="text-sm text-text-secondary">{match.away_team.name}</div>
          </div>
        </div>

        {/* Match Info */}
        <div className="text-center text-sm text-text-secondary mb-4">
          <div>{formatDate(matchDate)} • {formatTime(matchDate)}</div>
          <div>{match.venue}</div>
        </div>

        {/* User Prediction */}
        {userPrediction && (
          <div className="border-t border-text-secondary/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Your prediction:</span>
              <span className="font-medium">
                {userPrediction.predicted_home_score} - {userPrediction.predicted_away_score}
              </span>
              {userPrediction.points_earned !== null && (
                <span
                  className={`font-bold ${
                    userPrediction.points_earned > 0 ? 'text-success' : 'text-text-secondary'
                  }`}
                >
                  +{userPrediction.points_earned} pts
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
