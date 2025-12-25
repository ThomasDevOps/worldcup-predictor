import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/database.types'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchOrCreateProfile(session.user.id, session.user)
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchOrCreateProfile(session.user.id, session.user)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchOrCreateProfile(userId: string, user: User) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

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
      }
    } else if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
    setLoading(false)
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

    // If session exists (no email confirmation required), create profile immediately
    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          display_name: displayName,
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { error: profileError }
      }
    } else if (data.user && !data.session) {
      // Email confirmation required - profile will be created after confirmation
      // displayName is stored in user metadata and will be used when profile is created
      return { error: new Error('Please check your email to confirm your account') }
    }

    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
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
