import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { BonusQuestion, BonusAnswer, BonusQuestionWithAnswer } from '../lib/database.types'

// Hook to fetch all bonus questions with user's answers
export function useBonusQuestions() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<BonusQuestionWithAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchQuestions()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('bonus_questions_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bonus_questions',
        },
        () => {
          fetchQuestions()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  async function fetchQuestions() {
    setLoading(true)

    // Fetch all questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('bonus_questions')
      .select('*')
      .order('deadline', { ascending: true })

    if (questionsError) {
      setError(questionsError)
      setLoading(false)
      return
    }

    // If user is logged in, fetch their answers
    if (user) {
      const { data: answersData } = await supabase
        .from('bonus_answers')
        .select('*')
        .eq('user_id', user.id)

      // Merge answers with questions
      const questionsWithAnswers = questionsData.map((q) => ({
        ...q,
        bonus_answer: answersData?.find((a) => a.question_id === q.id) || null,
      }))
      setQuestions(questionsWithAnswers)
    } else {
      setQuestions(questionsData.map((q) => ({ ...q, bonus_answer: null })))
    }

    setLoading(false)
  }

  return { questions, loading, error, refetch: fetchQuestions }
}

// Hook for a single bonus question with user's answer
export function useBonusQuestion(questionId: string) {
  const { user } = useAuth()
  const [question, setQuestion] = useState<BonusQuestion | null>(null)
  const [answer, setAnswer] = useState<BonusAnswer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (questionId) {
      fetchQuestion()
    }
  }, [questionId, user])

  async function fetchQuestion() {
    setLoading(true)

    // Fetch question
    const { data: questionData, error: questionError } = await supabase
      .from('bonus_questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (questionError) {
      setError(questionError)
      setLoading(false)
      return
    }

    setQuestion(questionData)

    // Fetch user's answer if logged in
    if (user) {
      const { data: answerData } = await supabase
        .from('bonus_answers')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle()

      setAnswer(answerData)
    }

    setLoading(false)
  }

  async function saveAnswer(answerText: string) {
    if (!user) return { error: new Error('Not authenticated') }

    setSaving(true)
    const { data, error } = await supabase
      .from('bonus_answers')
      .upsert(
        {
          user_id: user.id,
          question_id: questionId,
          answer: answerText,
        },
        {
          onConflict: 'user_id,question_id',
        }
      )
      .select()
      .single()

    if (error) {
      setError(error)
    } else {
      setAnswer(data)
    }
    setSaving(false)

    return { error }
  }

  return { question, answer, loading, saving, error, saveAnswer, refetch: fetchQuestion }
}

// Admin hook to fetch all answers for a question
export function useBonusAnswers(questionId: string) {
  const [answers, setAnswers] = useState<(BonusAnswer & { profile: { display_name: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (questionId) {
      fetchAnswers()

      // Subscribe to realtime updates
      const subscription = supabase
        .channel(`bonus_answers:${questionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bonus_answers',
            filter: `question_id=eq.${questionId}`,
          },
          () => {
            fetchAnswers()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [questionId])

  async function fetchAnswers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bonus_answers')
      .select(`
        *,
        profile:profiles(display_name)
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error)
    } else {
      setAnswers(data as unknown as (BonusAnswer & { profile: { display_name: string } })[])
    }
    setLoading(false)
  }

  return { answers, loading, error, refetch: fetchAnswers }
}

// Admin function to grade a bonus question
export async function gradeBonusQuestion(questionId: string, correctAnswer: string) {
  const { error } = await supabase.rpc('grade_bonus_question', {
    p_question_id: questionId,
    p_correct_answer: correctAnswer,
  })

  return { error }
}
