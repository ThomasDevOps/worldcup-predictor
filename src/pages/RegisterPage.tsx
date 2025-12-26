import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters')
      return
    }

    setLoading(true)

    const { error } = await signUp(email, password, displayName.trim())

    setLoading(false)

    if (error) {
      // Check if this is the email confirmation message (not really an error)
      if (error.message?.includes('check your email')) {
        setSuccess('Account created! Please check your email to confirm your account before signing in.')
      } else {
        setError(error.message || 'An error occurred during sign up')
      }
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/wc2026-logo.png"
            alt="FIFA World Cup 2026"
            className="w-48 h-auto mx-auto mb-4"
          />
          <p className="text-text-secondary">Prediction Game</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm text-text-secondary mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input w-full"
                placeholder="How others will see you"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-text-secondary mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-text-secondary mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            {error && <p className="text-live text-sm">{error}</p>}

            {success && (
              <div className="bg-success/20 text-success text-sm py-3 px-4 rounded-lg">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Creating account...' : success ? 'Account Created' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
