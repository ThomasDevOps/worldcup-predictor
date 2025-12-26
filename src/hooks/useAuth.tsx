import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/database.types'

const PROFILE_CACHE_KEY = 'wc26_cached_profile'
const USER_CACHE_KEY = 'wc26_cached_user'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to get cached profile from localStorage
function getCachedProfile(): Profile | null {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// Helper to cache profile in localStorage
function setCachedProfile(profile: Profile | null) {
  try {
    if (profile) {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile))
    } else {
      localStorage.removeItem(PROFILE_CACHE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Helper to get cached user from localStorage (for instant hydration)
function getCachedUser(): User | null {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// Helper to cache user in localStorage
function setCachedUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_CACHE_KEY)
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with cached data for instant hydration
  const cachedUser = getCachedUser()
  const cachedProfile = getCachedProfile()
  const [user, setUser] = useState<User | null>(cachedUser)
  const [profile, setProfile] = useState<Profile | null>(cachedProfile)
  const [session, setSession] = useState<Session | null>(null)
  // If we have cached user, start with loading=false for instant render
  const [loading, setLoading] = useState(!cachedUser)
  const profileFetchedRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    // Single initialization function
    async function initializeAuth() {
      // Get session first
      const { data: { session } } = await supabase.auth.getSession()

      if (!isMounted) return

      setSession(session)
      setUser(session?.user ?? null)
      setCachedUser(session?.user ?? null)

      if (session?.user) {
        // If we have cached profile for this user, just refresh in background
        if (cachedProfile && cachedProfile.id === session.user.id) {
          // Already showing content (loading was false), just refresh profile
          fetchOrCreateProfile(session.user.id, session.user, true)
        } else {
          // No cache or different user, fetch and wait
          await fetchOrCreateProfile(session.user.id, session.user, false)
          if (isMounted) setLoading(false)
        }
      } else {
        // No valid session - clear all caches
        setCachedProfile(null)
        setCachedUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        setSession(session)
        setUser(session?.user ?? null)
        setCachedUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
          setCachedProfile(null)
          setCachedUser(null)
          setProfile(null)
          setLoading(false)
          profileFetchedRef.current = false
        } else if (session?.user && event === 'SIGNED_IN') {
          await fetchOrCreateProfile(session.user.id, session.user, false)
          if (isMounted) setLoading(false)
        }
      }
    )

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function fetchOrCreateProfile(userId: string, user: User, isBackground = false) {
    // Skip if already fetched in this session (prevent duplicate calls)
    if (profileFetchedRef.current && isBackground) return
    profileFetchedRef.current = true

    // Shorter timeout for better UX
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
    )

    try {
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        timeoutPromise
      ])

      if (error && error.code === 'PGRST116') {
        // Profile not found - create it from user metadata (set during signup)
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: displayName,
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          setProfile(newProfile)
          setCachedProfile(newProfile)
        }
      } else if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
        setCachedProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch failed (timeout or error):', err)
      // On timeout, keep using cached profile if available
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  async function signInWithUsername(usernameOrEmail: string, password: string) {
    let email = usernameOrEmail

    // If input doesn't look like an email, look up the email by username
    if (!usernameOrEmail.includes('@')) {
      const { data: foundEmail, error: lookupError } = await supabase
        .rpc('get_email_by_username', { username: usernameOrEmail })

      if (lookupError) {
        console.error('Error looking up username:', lookupError)
        return { error: new Error('An error occurred during sign in') }
      }

      if (!foundEmail) {
        return { error: new Error('Invalid username or password') }
      }

      email = foundEmail
    }

    // Sign in with the email
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Return generic error to not reveal if username/email exists
      return { error: new Error('Invalid username or password') }
    }

    return { error: null }
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) return { error }

    // Profile will be created by fetchOrCreateProfile via onAuthStateChange
    // The displayName is stored in user metadata and will be used there
    if (data.user && !data.session) {
      // Email confirmation required
      return { error: new Error('Please check your email to confirm your account') }
    }

    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setCachedProfile(null)
    profileFetchedRef.current = false
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signInWithUsername,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
