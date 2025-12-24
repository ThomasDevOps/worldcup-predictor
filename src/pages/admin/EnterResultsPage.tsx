import { useState } from 'react'
import { useMatches } from '../../hooks/useMatches'
import { supabase } from '../../lib/supabase'
import type { MatchWithTeams, MatchStatus } from '../../lib/database.types'

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

  const handleSave = async (matchId: string) => {
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

    const { error } = await supabase
      .from('matches')
      .update({
        home_score: home,
        away_score: away,
        status: 'finished' as MatchStatus,
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

  const handleSetLive = async (matchId: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'live' as MatchStatus })
      .eq('id', matchId)

    if (!error) {
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-warning">⚙️</span>
        <h1 className="text-2xl font-bold">Enter Match Results</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'scheduled', 'live', 'finished'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-card text-text-secondary hover:bg-card/80'
            }`}
          >
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
                  className={`badge ${
                    match.status === 'live'
                      ? 'badge-live'
                      : match.status === 'finished'
                      ? 'badge-success'
                      : 'bg-text-secondary/20 text-text-secondary'
                  }`}
                >
                  {match.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="font-semibold">{match.home_team.name}</div>
                  <div className="text-sm text-text-secondary">{match.home_team.country_code}</div>
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
                  <div className="text-2xl font-bold px-4">
                    {match.status === 'finished' || match.status === 'live'
                      ? `${match.home_score} - ${match.away_score}`
                      : 'vs'}
                  </div>
                )}

                <div className="flex-1 text-right">
                  <div className="font-semibold">{match.away_team.name}</div>
                  <div className="text-sm text-text-secondary">{match.away_team.country_code}</div>
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

              <div className="flex gap-2">
                {editingMatch === match.id ? (
                  <>
                    <button
                      onClick={() => handleSave(match.id)}
                      disabled={saving}
                      className="btn-primary disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Result'}
                    </button>
                    <button onClick={handleCancel} className="btn-secondary">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(match)}
                      className="btn-primary"
                    >
                      {match.status === 'finished' ? 'Edit Result' : 'Enter Result'}
                    </button>
                    {match.status === 'scheduled' && (
                      <button
                        onClick={() => handleSetLive(match.id)}
                        className="btn-secondary"
                      >
                        Set Live
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
