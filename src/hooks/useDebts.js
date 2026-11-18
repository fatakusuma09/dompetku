import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const GUEST_DEBT_KEY = 'dompetku_guest_debt'

const DEFAULT_GUEST_DEBT = [
  {
    id: 'debt-1',
    tipe: 'piutang',
    nama_orang: 'Dimas (Teman Lab)',
    jumlah: 35000,
    catatan: 'Talangan beli modul praktikum',
    lunas: false,
    tanggal: new Date().toISOString().split('T')[0],
  },
  {
    id: 'debt-2',
    tipe: 'hutang',
    nama_orang: 'Rian',
    jumlah: 20000,
    catatan: 'Pinjam bayar parkir bulanan',
    lunas: false,
    tanggal: new Date().toISOString().split('T')[0],
  },
]

export function useDebts() {
  const { user, isGuest } = useAuth()
  const [allDebts, setAllDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalHutang: 0,
    totalPiutang: 0,
  })

  const debts = allDebts.filter((d) => !d.lunas)

  const calcSummary = (data) => {
    const active = (data || []).filter((d) => !d.lunas)
    const totalHutang = active
      .filter((d) => d.tipe === 'hutang')
      .reduce((sum, d) => sum + Number(d.jumlah), 0)
    const totalPiutang = active
      .filter((d) => d.tipe === 'piutang')
      .reduce((sum, d) => sum + Number(d.jumlah), 0)
    setSummary({ totalHutang, totalPiutang })
  }

  const fetchDebts = useCallback(async () => {
    if (!user) return
    setLoading(true)

    if (isGuest) {
      const saved = localStorage.getItem(GUEST_DEBT_KEY)
      const data = saved ? JSON.parse(saved) : DEFAULT_GUEST_DEBT
      if (!saved) {
        localStorage.setItem(GUEST_DEBT_KEY, JSON.stringify(DEFAULT_GUEST_DEBT))
      }
      setAllDebts(data)
      calcSummary(data)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAllDebts(data || [])
      calcSummary(data || [])
    } catch {
      setAllDebts([])
      calcSummary([])
    } finally {
      setLoading(false)
    }
  }, [user, isGuest])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const addDebt = async ({ tipe, nama_orang, jumlah, catatan }) => {
    if (!user) return

    if (isGuest) {
      const newDebt = {
        id: 'debt-' + Date.now(),
        tipe,
        nama_orang,
        jumlah: Number(jumlah),
        catatan: catatan || '',
        lunas: false,
        tanggal: new Date().toISOString().split('T')[0],
      }
      const updated = [newDebt, ...allDebts]
      setAllDebts(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_DEBT_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase.from('debts').insert({
      user_id: user.id,
      tipe,
      nama_orang,
      jumlah: Number(jumlah),
      catatan: catatan || '',
    })
    if (error) throw error
    await fetchDebts()
  }

  const settleDebt = async (id) => {
    if (isGuest) {
      const updated = allDebts.map((d) =>
        d.id === id
          ? {
              ...d,
              lunas: true,
              tanggal_lunas: new Date().toISOString().split('T')[0],
            }
          : d
      )
      setAllDebts(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_DEBT_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase
      .from('debts')
      .update({
        lunas: true,
        tanggal_lunas: new Date().toISOString().split('T')[0],
      })
      .eq('id', id)
    if (error) throw error
    await fetchDebts()
  }

  const deleteDebt = async (id) => {
    if (isGuest) {
      const updated = allDebts.filter((d) => d.id !== id)
      setAllDebts(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_DEBT_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase.from('debts').delete().eq('id', id)
    if (error) throw error
    await fetchDebts()
  }

  return {
    debts,
    allDebts,
    loading,
    summary,
    fetchDebts,
    addDebt,
    settleDebt,
    deleteDebt,
  }
}
