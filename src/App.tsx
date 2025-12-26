import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { Layout } from './components/Layout'

// Public pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

// Protected pages
import { DashboardPage } from './pages/DashboardPage'
import { MatchesPage } from './pages/MatchesPage'
import { MatchDetailPage } from './pages/MatchDetailPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { MyPredictionsPage } from './pages/MyPredictionsPage'
import { ProfilePage } from './pages/ProfilePage'

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { EnterResultsPage } from './pages/admin/EnterResultsPage'
import { ManageUsersPage } from './pages/admin/ManageUsersPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:matchId" element={<MatchDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/my-predictions" element={<MyPredictionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/results" element={<EnterResultsPage />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
