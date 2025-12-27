import { useState } from 'react'
import { useBonusQuestions, useBonusQuestion } from '../hooks/useBonusQuestions'
import type { BonusQuestionWithAnswer } from '../lib/database.types'

function BonusQuestionCard({ question, onAnswerSaved }: { question: BonusQuestionWithAnswer; onAnswerSaved: () => void }) {
  const { answer, saving, saveAnswer } = useBonusQuestion(question.id)
  const [inputValue, setInputValue] = useState(answer?.answer || question.bonus_answer?.answer || '')
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const now = new Date()
  const deadline = new Date(question.deadline)
  const isLocked = now >= deadline || question.is_graded

  // Calculate time until deadline
  const timeUntilDeadline = deadline.getTime() - now.getTime()
  const daysUntil = Math.floor(timeUntilDeadline / (1000 * 60 * 60 * 24))
  const hoursUntil = Math.floor((timeUntilDeadline % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaveSuccess(false)

    if (!inputValue.trim()) {
      setError('Please enter an answer')
      return
    }

    const { error } = await saveAnswer(inputValue.trim())
    if (error) {
      setError(error.message)
    } else {
      setSaveSuccess(true)
      onAnswerSaved()
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const existingAnswer = answer?.answer || question.bonus_answer?.answer
  const pointsEarned = answer?.points_earned ?? question.bonus_answer?.points_earned

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{question.question_text}</h3>
          <div className="text-sm text-text-secondary mt-1">
            <span className="text-primary font-medium">{question.points_value} pts</span>
            {' • '}
            {question.answer_type === 'player' && 'Player name'}
            {question.answer_type === 'team' && 'Team name'}
            {question.answer_type === 'text' && 'Text answer'}
            {question.answer_type === 'number' && 'Number'}
          </div>
        </div>
        {question.is_graded && (
          <span className="px-2 py-1 bg-success/20 text-success text-xs font-medium rounded">
            Graded
          </span>
        )}
      </div>

      {isLocked ? (
        <div className="space-y-3">
          {existingAnswer ? (
            <div>
              <div className="text-sm text-text-secondary">Your answer:</div>
              <div className="font-medium">{existingAnswer}</div>
            </div>
          ) : (
            <div className="text-text-secondary">No answer submitted</div>
          )}

          {question.is_graded && (
            <>
              <div className="border-t border-text-secondary/20 pt-3">
                <div className="text-sm text-text-secondary">Correct answer:</div>
                <div className="font-medium text-success">{question.correct_answer}</div>
              </div>

              {pointsEarned !== null && pointsEarned !== undefined && (
                <div className={`text-lg font-bold ${pointsEarned > 0 ? 'text-success' : 'text-text-secondary'}`}>
                  +{pointsEarned} pts
                </div>
              )}
            </>
          )}

          {!question.is_graded && (
            <p className="text-sm text-text-secondary">
              Submissions closed. Waiting for results.
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                question.answer_type === 'player'
                  ? 'e.g., Kylian Mbappe'
                  : question.answer_type === 'team'
                  ? 'e.g., France'
                  : 'Enter your answer'
              }
              className="input w-full"
            />
          </div>

          {error && <p className="text-live text-sm">{error}</p>}

          {saveSuccess && (
            <div className="bg-success/20 text-success text-sm py-2 px-4 rounded-lg">
              {existingAnswer ? 'Answer updated!' : 'Answer saved!'}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : existingAnswer ? 'Update Answer' : 'Submit Answer'}
            </button>

            <span className="text-sm text-text-secondary">
              {daysUntil > 0
                ? `${daysUntil}d ${hoursUntil}h left`
                : `${hoursUntil}h left`}
            </span>
          </div>
        </form>
      )}
    </div>
  )
}

export function BonusQuestionsPage() {
  const { questions, loading, refetch } = useBonusQuestions()

  const answeredCount = questions.filter((q) => q.bonus_answer?.answer).length
  const gradedQuestions = questions.filter((q) => q.is_graded)
  const totalBonusPoints = gradedQuestions.reduce(
    (sum, q) => sum + (q.bonus_answer?.points_earned ?? 0),
    0
  )
  const maxPossiblePoints = questions.reduce((sum, q) => sum + q.points_value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bonus Questions</h1>
        <p className="text-text-secondary mt-1">
          Earn extra points by predicting tournament outcomes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Questions</div>
          <div className="text-2xl font-bold">{questions.length}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Answered</div>
          <div className="text-2xl font-bold text-primary">
            {answeredCount}/{questions.length}
          </div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Bonus Points</div>
          <div className="text-2xl font-bold text-success">{totalBonusPoints}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Max Possible</div>
          <div className="text-2xl font-bold">{maxPossiblePoints}</div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="card text-center text-text-secondary py-12">
          Loading bonus questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="card text-center text-text-secondary py-12">
          No bonus questions available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <BonusQuestionCard
              key={question.id}
              question={question}
              onAnswerSaved={refetch}
            />
          ))}
        </div>
      )}
    </div>
  )
}
