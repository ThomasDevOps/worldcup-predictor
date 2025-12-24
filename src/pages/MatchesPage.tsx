import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { MatchCard } from '../components/MatchCard'

const STAGES = [
  { value: 'all', label: 'All Matches' },
  { value: 'Group A', label: 'Group A' },
  { value: 'Group B', label: 'Group B' },
  { value: 'Group C', label: 'Group C' },
  { value: 'Group D', label: 'Group D' },
  { value: 'Group E', label: 'Group E' },
  { value: 'Group F', label: 'Group F' },
  { value: 'Group G', label: 'Group G' },
  { value: 'Group H', label: 'Group H' },
  { value: 'Group I', label: 'Group I' },
  { value: 'Group J', label: 'Group J' },
  { value: 'Group K', label: 'Group K' },
  { value: 'Group L', label: 'Group L' },
  { value: 'Round of 32', label: 'Round of 32' },
  { value: 'Round of 16', label: 'Round of 16' },
  { value: 'Quarter-finals', label: 'Quarter-finals' },
  { value: 'Semi-finals', label: 'Semi-finals' },
  { value: 'Third Place', label: 'Third Place' },
  { value: 'Final', label: 'Final' },
]

export function MatchesPage() {
  const [filter, setFilter] = useState('all')
  const { matches, loading } = useMatches(filter === 'all' ? undefined : filter)

  // Group matches by date
  const matchesByDate = matches.reduce((acc, match) => {
    const date = new Date(match.match_date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(match)
    return acc
  }, {} as Record<string, typeof matches>)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Matches</h1>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <button
            key={stage.value}
            onClick={() => setFilter(stage.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === stage.value
                ? 'bg-primary text-white'
                : 'bg-card text-text-secondary hover:bg-card/80'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="card text-center text-text-secondary">
          No matches found for this filter.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(matchesByDate).map(([date, dateMatches]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold text-text-secondary mb-4">{date}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
