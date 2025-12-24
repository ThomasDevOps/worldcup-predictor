import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Prediction, PredictionWithMatch, PredictionWithUser } from '../lib/database.types'

export function useUserPredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<PredictionWithMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user) {
      fetchPredictions()
    }
  }, [user])

  async function fetchPredictions() {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('predictions')
      .select(`
        *,
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error)
    } else {
      setPredictions(data as unknown as PredictionWithMatch[])
    }
    setLoading(false)
  }

  return { predictions, loading, error, refetch: fetchPredictions }
}

export function useMatchPredictions(matchId: string) {
  const [predictions, setPredictions] = useState<PredictionWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (matchId) {
      fetchPredictions()

      // Subscribe to realtime updates
      const subscription = supabase
        .channel(`predictions:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'predictions',
            filter: `match_id=eq.${matchId}`,
          },
          () => {
            fetchPredictions()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [matchId])

  async function fetchPredictions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('predictions')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('match_id', matchId)
      .order('points_earned', { ascending: false, nullsFirst: false })

    if (error) {
      setError(error)
    } else {
      setPredictions(data as unknown as PredictionWithUser[])
    }
    setLoading(false)
  }

  return { predictions, loading, error, refetch: fetchPredictions }
}

export function usePrediction(matchId: string) {
  const { user } = useAuth()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user && matchId) {
      fetchPrediction()
    }
  }, [user, matchId])

  async function fetchPrediction() {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .maybeSingle()

    if (error) {
      setError(error)
    } else {
      setPrediction(data)
    }
    setLoading(false)
  }

  async function savePrediction(homeScore: number, awayScore: number) {
    if (!user) return { error: new Error('Not authenticated') }

    setSaving(true)
    const { data, error } = await supabase
      .from('predictions')
      .upsert({
        user_id: user.id,
        match_id: matchId,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
      }, {
        onConflict: 'user_id,match_id',
      })
      .select()
      .single()

    if (error) {
      setError(error)
    } else {
      setPrediction(data)
    }
    setSaving(false)

    return { error }
  }

  return { prediction, loading, saving, error, savePrediction, refetch: fetchPrediction }
}
