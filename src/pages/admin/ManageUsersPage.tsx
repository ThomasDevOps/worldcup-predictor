import { useState } from 'react'
import { useLeaderboard } from '../../hooks/useLeaderboard'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/database.types'

export function ManageUsersPage() {
  const { profiles, loading, refetch } = useLeaderboard()
  const [updating, setUpdating] = useState<string | null>(null)

  const paidCount = profiles.filter((p) => p.has_paid).length
  const unpaidCount = profiles.filter((p) => !p.has_paid).length

  async function togglePaymentStatus(profile: Profile) {
    setUpdating(profile.id)
    const { error } = await supabase
      .from('profiles')
      .update({ has_paid: !profile.has_paid })
      .eq('id', profile.id)

    if (error) {
      console.error('Failed to update payment status:', error)
      alert('Failed to update payment status')
    } else {
      refetch()
    }
    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-warning">👥</span>
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Total Users</div>
          <div className="text-2xl font-bold">{profiles.length}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Paid</div>
          <div className="text-2xl font-bold text-success">{paidCount}</div>
        </div>
        <div className="card">
          <div className="text-text-secondary text-sm mb-1">Unpaid</div>
          <div className="text-2xl font-bold text-warning">{unpaidCount}</div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">All Users</h2>
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    profile.has_paid ? 'bg-success' : 'bg-warning'
                  }`}
                />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {profile.display_name}
                    {profile.is_admin && (
                      <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {profile.total_points} points
                  </div>
                </div>
              </div>
              <button
                onClick={() => togglePaymentStatus(profile)}
                disabled={updating === profile.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  profile.has_paid
                    ? 'bg-success/20 text-success hover:bg-success/30'
                    : 'bg-warning/20 text-warning hover:bg-warning/30'
                } disabled:opacity-50`}
              >
                {updating === profile.id
                  ? 'Updating...'
                  : profile.has_paid
                    ? 'Paid'
                    : 'Mark as Paid'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
