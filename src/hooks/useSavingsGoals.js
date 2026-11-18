import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const GUEST_SAVINGS_KEY = 'dompetku_guest_savings'

const DEFAULT_GUEST_SAVINGS = [
  {
    id: 'save-1',
    nama_target: 'Beli Laptop Coding',
    target_jumlah: 7500000,
    terkumpul: 3200000,
    deadline: '2027-02-28',
    warna: '#059669',
    selesai: false,
  },
  {
    id: 'save-2',
    nama_target: 'Dana Darurat Kos & Skripsi',
    target_jumlah: 1500000,
    terkumpul: 900000,
    deadline: '2026-12-31',
    warna: '#2563eb',
    selesai: false,
  },
  {
    id: 'save-3',
    nama_target: 'Liburan Semester ke Jogja',
    target_jumlah: 600000,
    terkumpul: 600000,
    deadline: '2026-11-30',
    warna: '#d97706',
    selesai: true,
  },
]

export function useSavingsGoals() {
  const { user, isGuest } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalTarget: 0,
    totalTerkumpul: 0,
    persentaseTotal: 0,
  })

  const calcSummary = (data) => {
    const list = data || []
    const totalTarget = list.reduce((sum, g) => sum + Number(g.target_jumlah), 0)
    const totalTerkumpul = list.reduce((sum, g) => sum + Number(g.terkumpul), 0)
    const persentaseTotal =
      totalTarget > 0 ? Math.min(Math.round((totalTerkumpul / totalTarget) * 100), 100) : 0

    setSummary({ totalTarget, totalTerkumpul, persentaseTotal })
  }

  const fetchGoals = useCallback(async () => {
    if (!user) return
    setLoading(true)

    if (isGuest) {
      const saved = localStorage.getItem(GUEST_SAVINGS_KEY)
      const data = saved ? JSON.parse(saved) : DEFAULT_GUEST_SAVINGS
      if (!saved) {
        localStorage.setItem(GUEST_SAVINGS_KEY, JSON.stringify(DEFAULT_GUEST_SAVINGS))
      }
      setGoals(data)
      calcSummary(data)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
      calcSummary(data || [])
    } catch {
      setGoals([])
      calcSummary([])
    } finally {
      setLoading(false)
    }
  }, [user, isGuest])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const addGoal = async ({ nama_target, target_jumlah, deadline, warna }) => {
    if (!user) return

    if (isGuest) {
      const newGoal = {
        id: 'save-' + Date.now(),
        nama_target,
        target_jumlah: Number(target_jumlah),
        terkumpul: 0,
        deadline: deadline || null,
        warna: warna || '#059669',
        selesai: false,
      }
      const updated = [newGoal, ...goals]
      setGoals(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_SAVINGS_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase.from('savings_goals').insert({
      user_id: user.id,
      nama_target,
      target_jumlah: Number(target_jumlah),
      terkumpul: 0,
      deadline: deadline || null,
      warna: warna || '#059669',
    })
    if (error) throw error
    await fetchGoals()
  }

  const depositSavings = async (id, nominal) => {
    const amount = Number(nominal)
    if (amount <= 0) return

    if (isGuest) {
      const updated = goals.map((g) => {
        if (g.id !== id) return g
        const nextTerkumpul = Number(g.terkumpul) + amount
        return {
          ...g,
          terkumpul: nextTerkumpul,
          selesai: nextTerkumpul >= Number(g.target_jumlah),
        }
      })
      setGoals(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_SAVINGS_KEY, JSON.stringify(updated))
      return
    }

    const targetGoal = goals.find((g) => g.id === id)
    if (!targetGoal) return

    const nextTerkumpul = Number(targetGoal.terkumpul) + amount
    const isSelesai = nextTerkumpul >= Number(targetGoal.target_jumlah)

    const { error } = await supabase
      .from('savings_goals')
      .update({
        terkumpul: nextTerkumpul,
        selesai: isSelesai,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    await fetchGoals()
  }

  const deleteGoal = async (id) => {
    if (isGuest) {
      const updated = goals.filter((g) => g.id !== id)
      setGoals(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_SAVINGS_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (error) throw error
    await fetchGoals()
  }

  return {
    goals,
    loading,
    summary,
    fetchGoals,
    addGoal,
    depositSavings,
    deleteGoal,
  }
}
