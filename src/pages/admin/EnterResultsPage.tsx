import { useState } from 'react'
import { useMatches } from '../../hooks/useMatches'
import { supabase } from '../../lib/supabase'
import type { MatchWithTeams, MatchStatus } from '../../lib/database.types'
import { TeamFlag } from '../../components/TeamFlag'

type FilterStatus = 'all' | MatchStatus

export function EnterResultsPage() {
  const [filter, setFilter] = useState<FilterStatus>('scheduled')
  const { matches, refetch } = useMatches()
  const [editingMatch, setEditingMatch] = useState<string | null>(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true
    return m.status === filter
  })

  const handleEdit = (match: MatchWithTeams) => {
    setEditingMatch(match.id)
    setHomeScore(match.home_score?.toString() ?? '')
    setAwayScore(match.away_score?.toString() ?? '')
    setError(null)
  }

  const handleCancel = () => {
    setEditingMatch(null)
    setHomeScore('')
    setAwayScore('')
    setError(null)
  }

  const handleSave = async (matchId: string, markAsFinished: boolean = true) => {
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

    setSaving(true)

    const match = matches.find((m) => m.id === matchId)
    const newStatus = markAsFinished
      ? 'finished'
      : match?.status === 'scheduled'
        ? 'live'
        : match?.status

    const { error } = await supabase
      .from('matches')
      .update({
        home_score: home,
        away_score: away,
        status: newStatus as MatchStatus,
      })
      .eq('id', matchId)

    if (error) {
      setError(error.message)
    } else {
      setEditingMatch(null)
      setHomeScore('')
      setAwayScore('')
      refetch()
    }

    setSaving(false)
  }

  const handleResetToScheduled = async (matchId: string) => {
    if (!confirm('Reset this match to scheduled? This will clear the scores and recalculate the leaderboard.')) {
      return
    }

    setSaving(true)
    setError(null)

    // Call the database function that handles everything with proper permissions
    const { error } = await supabase.rpc('reset_match_to_scheduled', {
      p_match_id: matchId
    })

    if (error) {
      setError(error.message)
    } else {
      setEditingMatch(null)
      refetch()
    }

    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-warning">⚙️</span>
        <h1 className="text-2xl font-bold">Enter Match Results</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'live', 'scheduled', 'finished'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === status
                ? status === 'live'
                  ? 'bg-live text-white'
                  : 'bg-primary text-white'
                : 'bg-card text-text-secondary hover:bg-card/80'
            }`}
          >
            {status === 'live' && <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse mr-1"></span>}
            {status}
          </button>
        ))}
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="card text-center text-text-secondary">
            No matches found
          </div>
        ) : (
          filteredMatches.map((match) => (
            <div key={match.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="badge bg-primary/20 text-primary">{match.stage}</span>
                <span
                  className={`badge flex items-center gap-1 ${
                    match.status === 'live'
                      ? 'bg-live/20 text-live'
                      : match.status === 'finished'
                        ? 'badge-success'
                        : 'bg-text-secondary/20 text-text-secondary'
                  }`}
                >
                  {match.status === 'live' && <span className="w-2 h-2 bg-live rounded-full animate-pulse"></span>}
                  {match.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 flex items-center gap-2">
                  <TeamFlag countryCode={match.home_team.country_code} size="md" />
                  <span className="font-semibold">{match.home_team.name}</span>
                </div>

                {editingMatch === match.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="input w-16 text-center"
                    />
                    <span className="text-text-secondary">-</span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="input w-16 text-center"
                    />
                  </div>
                ) : (
                  <div className={`text-2xl font-bold px-4 ${match.status === 'live' ? 'text-live' : ''}`}>
                    {match.status === 'live'
                      ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
                      : match.status === 'finished'
                        ? `${match.home_score} - ${match.away_score}`
                        : 'vs'}
                  </div>
                )}

                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className="font-semibold">{match.away_team.name}</span>
                  <TeamFlag countryCode={match.away_team.country_code} size="md" />
                </div>
              </div>

              <div className="text-sm text-text-secondary mb-4">
                {new Date(match.match_date).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • {match.venue}
              </div>

              {error && editingMatch === match.id && (
                <p className="text-live text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-2 flex-wrap">
                {editingMatch === match.id ? (
                  <>
                    {match.status === 'live' ? (
                      <>
                        <button
                          onClick={() => handleSave(match.id, false)}
                          disabled={saving}
                          className="btn-secondary disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Update Score'}
                        </button>
                        <button
                          onClick={() => handleSave(match.id, true)}
                          disabled={saving}
                          className="btn-primary disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Finish Match'}
                        </button>
                        <button
                          onClick={() => handleResetToScheduled(match.id)}
                          disabled={saving}
                          className="btn-secondary bg-warning/20 text-warning hover:bg-warning/30 disabled:opacity-50"
                        >
                          {saving ? 'Resetting...' : 'Reset to Scheduled'}
                        </button>
                      </>
                    ) : match.status === 'scheduled' ? (
                      <>
                        <button
                          onClick={() => handleSave(match.id, false)}
                          disabled={saving}
                          className="btn-secondary disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Start Live'}
                        </button>
                        <button
                          onClick={() => handleSave(match.id, true)}
                          disabled={saving}
                          className="btn-primary disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save as Final'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSave(match.id, true)}
                          disabled={saving}
                          className="btn-primary disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Result'}
                        </button>
                        <button
                          onClick={() => handleResetToScheduled(match.id)}
                          disabled={saving}
                          className="btn-secondary bg-warning/20 text-warning hover:bg-warning/30 disabled:opacity-50"
                        >
                          {saving ? 'Resetting...' : 'Reset to Scheduled'}
                        </button>
                      </>
                    )}
                    <button onClick={handleCancel} className="btn-secondary">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit(match)}
                    className="btn-primary"
                  >
                    {match.status === 'finished'
                      ? 'Edit Result'
                      : match.status === 'live'
                        ? 'Update Score'
                        : 'Enter Result'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
