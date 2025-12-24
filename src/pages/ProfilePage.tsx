import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function ProfilePage() {
  const { profile, user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', profile?.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Refresh the page to update the profile in context
      window.location.reload()
    }

    setSaving(false)
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="input w-full bg-background/50 cursor-not-allowed"
            />
          </div>

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
            />
          </div>

          {error && <p className="text-live text-sm">{error}</p>}
          {success && <p className="text-success text-sm">Profile updated successfully!</p>}

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Stats</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-text-secondary">Total Points</span>
            <span className="font-bold text-primary">{profile?.total_points ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Admin</span>
            <span>{profile?.is_admin ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Member Since</span>
            <span>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => signOut()}
        className="btn-secondary w-full"
      >
        Sign Out
      </button>
    </div>
  )
}
