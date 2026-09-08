import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

const NOT_CONFIGURED_MESSAGE =
  'Supabase isn\u2019t configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in ' +
  'visions-app/.env (see the README), then restart the dev server.'

// Supabase-js throws a bare `TypeError: Failed to fetch` when it can't
// reach the project at all (wrong/placeholder URL, no network, CORS,
// etc.) — turn that into something a person can actually act on.
function friendlyAuthError(err) {
  if (!isSupabaseConfigured) return new Error(NOT_CONFIGURED_MESSAGE)
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return new Error(
      'Could not reach Supabase. Double-check VITE_SUPABASE_URL in visions-app/.env is your ' +
        'actual project URL, that the project is active, and that you have a network connection.'
    )
  }
  return err
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[auth] could not load profile:', error.message)
    return null
  }
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return
      setSession(data.session)
      if (data.session?.user) {
        setProfile(await fetchProfile(data.session.user.id))
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        setProfile(await fetchProfile(newSession.user.id))
      } else {
        setProfile(null)
      }
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MESSAGE)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      throw friendlyAuthError(err)
    }
  }

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_MESSAGE)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    } catch (err) {
      throw friendlyAuthError(err)
    }
  }

  const signOut = () => supabase.auth.signOut()

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.access_token ?? null,
      role: profile?.role ?? null,
      isAdmin: profile?.role === 'admin',
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
    }),
    [session, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
