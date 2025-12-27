import { useState } from 'react'
import { useBonusQuestions, useBonusAnswers, gradeBonusQuestion } from '../../hooks/useBonusQuestions'
import { supabase } from '../../lib/supabase'
import type { BonusQuestion } from '../../lib/database.types'

function AnswersList({ questionId, correctAnswer }: { questionId: string; correctAnswer: string | null }) {
  const { answers, loading } = useBonusAnswers(questionId)

  if (loading) {
    return <div className="text-text-secondary text-sm">Loading answers...</div>
  }

  if (answers.length === 0) {
    return <div className="text-text-secondary text-sm">No answers yet</div>
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium text-text-secondary">
        {answers.length} answer{answers.length !== 1 ? 's' : ''}:
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {answers.map((ans) => {
          const isCorrect = correctAnswer && ans.answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
          return (
            <div
              key={ans.id}
              className={`flex justify-between items-center text-sm p-2 rounded ${
                correctAnswer
                  ? isCorrect
                    ? 'bg-success/20'
                    : 'bg-live/10'
                  : 'bg-card/50'
              }`}
            >
              <span>
                <span className="font-medium">{ans.profile.display_name}:</span>{' '}
                {ans.answer}
              </span>
              {ans.points_earned !== null && (
                <span className={`font-bold ${ans.points_earned > 0 ? 'text-success' : 'text-text-secondary'}`}>
                  +{ans.points_earned}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function QuestionCard({ question, onUpdate }: { question: BonusQuestion; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isGrading, setIsGrading] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer || '')
  const [questionText, setQuestionText] = useState(question.question_text)
  const [pointsValue, setPointsValue] = useState(question.points_value.toString())
  const [deadline, setDeadline] = useState(
    new Date(question.deadline).toISOString().slice(0, 16)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)

  const now = new Date()
  const deadlineDate = new Date(question.deadline)
  const isLocked = now >= deadlineDate

  const handleSaveEdit = async () => {
    setError(null)
    setSaving(true)

    const { error } = await supabase
      .from('bonus_questions')
      .update({
        question_text: questionText,
        points_value: parseInt(pointsValue, 10),
        deadline: new Date(deadline).toISOString(),
      })
      .eq('id', question.id)

    if (error) {
      setError(error.message)
    } else {
      setIsEditing(false)
      onUpdate()
    }

    setSaving(false)
  }

  const handleGrade = async () => {
    if (!correctAnswer.trim()) {
      setError('Please enter the correct answer')
      return
    }

    setError(null)
    setSaving(true)

    const { error } = await gradeBonusQuestion(question.id, correctAnswer.trim())

    if (error) {
      setError(error.message)
    } else {
      setIsGrading(false)
      onUpdate()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this question? This will also delete all answers.')) {
      return
    }

    setSaving(true)
    const { error } = await supabase.from('bonus_questions').delete().eq('id', question.id)

    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      onUpdate()
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="input w-full font-semibold"
            />
          ) : (
            <h3 className="text-lg font-semibold">{question.question_text}</h3>
          )}
          <div className="text-sm text-text-secondary mt-1">
            Type: {question.answer_type}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {question.is_graded && (
            <span className="px-2 py-1 bg-success/20 text-success text-xs font-medium rounded">
              Graded
            </span>
          )}
          {isLocked && !question.is_graded && (
            <span className="px-2 py-1 bg-warning/20 text-warning text-xs font-medium rounded">
              Locked
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-text-secondary">Points</div>
          {isEditing ? (
            <input
              type="number"
              value={pointsValue}
              onChange={(e) => setPointsValue(e.target.value)}
              className="input w-20"
            />
          ) : (
            <div className="font-bold text-primary">{question.points_value} pts</div>
          )}
        </div>
        <div>
          <div className="text-xs text-text-secondary">Deadline</div>
          {isEditing ? (
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input"
            />
          ) : (
            <div>
              {deadlineDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>

      {question.is_graded && (
        <div className="mb-4 p-3 bg-success/10 rounded-lg">
          <div className="text-xs text-text-secondary">Correct Answer</div>
          <div className="font-bold text-success">{question.correct_answer}</div>
        </div>
      )}

      {isGrading && (
        <div className="mb-4 p-3 bg-card/50 rounded-lg">
          <div className="text-sm font-medium mb-2">Enter the correct answer:</div>
          <input
            type="text"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="Enter correct answer"
            className="input w-full"
          />
        </div>
      )}

      {error && <p className="text-live text-sm mb-4">{error}</p>}

      <div className="flex gap-2 flex-wrap">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </>
        ) : isGrading ? (
          <>
            <button
              onClick={handleGrade}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Grading...' : 'Confirm & Grade'}
            </button>
            <button onClick={() => setIsGrading(false)} className="btn-secondary">
              Cancel
            </button>
          </>
        ) : (
          <>
            {!question.is_graded && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                {isLocked && (
                  <button
                    onClick={() => setIsGrading(true)}
                    className="btn-primary"
                  >
                    Grade Question
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="btn-secondary"
            >
              {showAnswers ? 'Hide Answers' : 'View Answers'}
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="btn-secondary bg-live/20 text-live hover:bg-live/30 disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {showAnswers && (
        <AnswersList questionId={question.id} correctAnswer={question.correct_answer} />
      )}
    </div>
  )
}

export function BonusQuestionsAdminPage() {
  const { questions, loading, refetch } = useBonusQuestions()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswerType, setNewAnswerType] = useState('player')
  const [newPoints, setNewPoints] = useState('10')
  const [newDeadline, setNewDeadline] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) {
      setError('Please enter a question')
      return
    }
    if (!newDeadline) {
      setError('Please set a deadline')
      return
    }

    setError(null)
    setSaving(true)

    const { error } = await supabase.from('bonus_questions').insert({
      question_text: newQuestion.trim(),
      answer_type: newAnswerType,
      points_value: parseInt(newPoints, 10),
      deadline: new Date(newDeadline).toISOString(),
    })

    if (error) {
      setError(error.message)
    } else {
      setShowAddForm(false)
      setNewQuestion('')
      setNewAnswerType('player')
      setNewPoints('10')
      setNewDeadline('')
      refetch()
    }

    setSaving(false)
  }

  const ungradedCount = questions.filter((q) => !q.is_graded).length
  const gradedCount = questions.filter((q) => q.is_graded).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-warning">⚙️</span>
        <h1 className="text-2xl font-bold">Manage Bonus Questions</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Total Questions</div>
          <div className="text-2xl font-bold">{questions.length}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Ungraded</div>
          <div className="text-2xl font-bold text-warning">{ungradedCount}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Graded</div>
          <div className="text-2xl font-bold text-success">{gradedCount}</div>
        </div>
      </div>

      {/* Add Question Form */}
      {showAddForm ? (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Add New Question</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Question</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g., Who will be the top scorer?"
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Answer Type</label>
                <select
                  value={newAnswerType}
                  onChange={(e) => setNewAnswerType(e.target.value)}
                  className="input w-full"
                >
                  <option value="player">Player</option>
                  <option value="team">Team</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Points</label>
                <input
                  type="number"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            {error && <p className="text-live text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleAddQuestion}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Question'}
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="btn-primary">
          + Add New Question
        </button>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="card text-center text-text-secondary py-12">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="card text-center text-text-secondary py-12">
          No bonus questions yet. Add your first question above.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} onUpdate={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}
