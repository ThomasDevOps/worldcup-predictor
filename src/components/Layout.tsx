import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const { profile, signOut } = useAuth()

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/matches', label: 'Matches' },
    { to: '/bonus', label: 'Bonus' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/my-predictions', label: 'My Predictions' },
  ]

  const adminLinks = [
    { to: '/admin', label: 'Admin' },
    { to: '/admin/results', label: 'Enter Results' },
    { to: '/admin/bonus', label: 'Bonus Q' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-text-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">WC2026</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-card'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {profile?.is_admin && (
                <>
                  <div className="w-px h-6 bg-text-secondary/20" />
                  {adminLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-warning/10 text-warning'
                            : 'text-text-secondary hover:text-text-primary hover:bg-card'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </>
              )}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <NavLink
                to="/profile"
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                {profile?.display_name}
              </NavLink>
              <button
                onClick={() => signOut()}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-text-secondary/10 z-50">
        <div className="flex overflow-x-auto py-2 px-2 gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex-shrink-0 flex flex-col items-center px-3 py-2 text-xs ${
                  isActive ? 'text-primary' : 'text-text-secondary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {profile?.is_admin && (
            <>
              <div className="flex-shrink-0 w-px h-8 self-center bg-text-secondary/20" />
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex-shrink-0 flex flex-col items-center px-3 py-2 text-xs ${
                      isActive ? 'text-warning' : 'text-warning/70'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  )
}
