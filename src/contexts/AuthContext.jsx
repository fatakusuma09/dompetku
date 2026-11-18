import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const AuthContext = createContext(null)

const GUEST_STORAGE_KEY = 'dompetku_guest'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  const fetchProfile = async (userId) => {
    try {
      if (!isSupabaseConfigured) {
        setProfile({
          id: userId,
          nama_lengkap: 'Pengguna',
          budget_bulanan: 1500000,
        })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch {
      setProfile({
        id: userId,
        nama_lengkap: 'Pengguna',
        budget_bulanan: 1500000,
      })
    }
  }

  useEffect(() => {
    // 1. Check local guest session first
    const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY)
    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest)
        setUser(parsed.user)
        setProfile(parsed.profile)
        setIsGuest(true)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(GUEST_STORAGE_KEY)
      }
    }

    // 2. If Supabase is not configured, stop loading immediately
    if (!isSupabaseConfigured) {
      setUser(null)
      setProfile(null)
      setLoading(false)
      return
    }

    // 3. Connect to Supabase Auth safely
    let unsubscribe = null

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.warn('Gagal memuat sesi Supabase:', err)
      } finally {
        setLoading(false)
      }

      try {
        const authListener = supabase.auth.onAuthStateChange(
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
        unsubscribe = authListener?.data?.subscription?.unsubscribe
      } catch (err) {
        console.warn('Gagal langganan auth listener:', err)
      }
    }

    initAuth()

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
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
    if (!isSupabaseConfigured) {
      throw new Error('Supabase belum dikonfigurasi. Silakan masuk sebagai Tamu terlebih dahulu.')
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email, password, namaLengkap) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase belum dikonfigurasi. Silakan masuk sebagai Tamu terlebih dahulu.')
    }
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
    if (!isSupabaseConfigured) {
      throw new Error('Supabase belum dikonfigurasi. Silakan masuk sebagai Tamu terlebih dahulu.')
    }
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
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
    } catch {
      // ignore
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
        isSupabaseConfigured,
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
