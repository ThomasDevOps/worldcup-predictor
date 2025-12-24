import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { MatchWithTeams } from '../lib/database.types'

export function useMatches(filter?: string) {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [filter])

  async function fetchMatches() {
    setLoading(true)

    let query = supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .order('match_date', { ascending: true })

    if (filter && filter !== 'all') {
      query = query.eq('stage', filter)
    }

    const { data, error } = await query

    if (error) {
      setError(error)
    } else {
      setMatches(data as unknown as MatchWithTeams[])
    }
    setLoading(false)
  }

  return { matches, loading, error, refetch: fetchMatches }
}

export function useMatch(matchId: string) {
  const [match, setMatch] = useState<MatchWithTeams | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (matchId) {
      fetchMatch()
    }
  }, [matchId])

  async function fetchMatch() {
    setLoading(true)

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq('id', matchId)
      .single()

    if (error) {
      setError(error)
    } else {
      setMatch(data as unknown as MatchWithTeams)
    }
    setLoading(false)
  }

  return { match, loading, error, refetch: fetchMatch }
}
