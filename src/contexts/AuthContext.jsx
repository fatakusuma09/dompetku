import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

const GUEST_STORAGE_KEY = 'dompetku_guest'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch {
      // Fallback profile if Supabase is offline/unconfigured
      setProfile({
        id: userId,
        nama_lengkap: 'Pengguna',
        budget_bulanan: 1500000,
      })
    }
  }

  useEffect(() => {
    // Check local guest session first
    const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY)
    if (savedGuest) {
      const parsed = JSON.parse(savedGuest)
      setUser(parsed.user)
      setProfile(parsed.profile)
      setIsGuest(true)
      setLoading(false)
      return
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        setLoading(false)
      }).catch(() => setLoading(false))

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (localStorage.getItem(GUEST_STORAGE_KEY)) return
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch {
      setLoading(false)
    }
  }, [])

  const loginAsGuest = () => {
    const guestData = {
      user: {
        id: 'guest-user-123',
        email: 'tamu@dompetku.local',
      },
      profile: {
        id: 'guest-user-123',
        nama_lengkap: 'Mahasiswa Tamu',
        budget_bulanan: 1500000,
      },
    }
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData))
    setUser(guestData.user)
    setProfile(guestData.profile)
    setIsGuest(true)
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email, password, namaLengkap) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: namaLengkap },
      },
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
  }

  const signOut = async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY)
    setIsGuest(false)
    setUser(null)
    setProfile(null)
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore offline error
    }
  }

  const updateProfile = async (updates) => {
    if (isGuest) {
      const updated = { ...profile, ...updates }
      setProfile(updated)
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({ user, profile: updated })
      )
      return
    }

    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    if (error) throw error
    await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        loginAsGuest,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return context
}
