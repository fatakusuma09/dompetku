import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth, getKantongListFromProfile } from '@/contexts/AuthContext'
import { getStartOfMonth, getEndOfMonth, getMatchingKantong } from '@/lib/utils'

const GUEST_TX_KEY = 'dompetku_guest_tx'

const DEFAULT_GUEST_TX = [
  {
    id: 'tx-1',
    tipe: 'pemasukan',
    jumlah: 1500000,
    kategori: 'Uang Saku',
    catatan: 'Kiriman bulanan orang tua',
    tanggal: new Date().toISOString().split('T')[0],
  },
  {
    id: 'tx-2',
    tipe: 'pengeluaran',
    jumlah: 25000,
    kategori: 'Makanan',
    catatan: 'Nasi padang siang',
    tanggal: new Date().toISOString().split('T')[0],
  },
  {
    id: 'tx-3',
    tipe: 'pengeluaran',
    jumlah: 15000,
    kategori: 'Print/Tugas',
    catatan: 'Print makalah lab',
    tanggal: new Date().toISOString().split('T')[0],
  },
  {
    id: 'tx-4',
    tipe: 'pengeluaran',
    jumlah: 18000,
    kategori: 'Nongkrong',
    catatan: 'Kopi susu kantin',
    tanggal: new Date().toISOString().split('T')[0],
  },
]

export function useTransactions() {
  const { user, isGuest, profile } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldo: 0,
    pengeluaranHariIni: 0,
    pengeluaranPerKantong: {},
    pengeluaranDailyHariIni: 0,
  })

  const calcSummary = useCallback((data) => {
    const today = new Date().toISOString().split('T')[0]
    const list = data || []
    const kantongList = getKantongListFromProfile(profile)
    const dailyKantong = kantongList.find((k) => k.isDaily) || kantongList[0]

    const totalPemasukan = list
      .filter((t) => t.tipe === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.jumlah), 0)

    const totalPengeluaran = list
      .filter((t) => t.tipe === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.jumlah), 0)

    const pengeluaranHariIni = list
      .filter((t) => t.tipe === 'pengeluaran' && t.tanggal === today)
      .reduce((sum, t) => sum + Number(t.jumlah), 0)

    const pengeluaranPerKantong = {}
    let pengeluaranDailyHariIni = 0

    list
      .filter((t) => t.tipe === 'pengeluaran')
      .forEach((t) => {
        const amt = Number(t.jumlah) || 0
        const matchedPocket = t.kantong_id
          ? kantongList.find((k) => k.id === t.kantong_id) || { id: t.kantong_id, isDaily: false }
          : getMatchingKantong(t.kategori, kantongList)
        const kId = matchedPocket?.id || dailyKantong?.id || 'k_makan'
        pengeluaranPerKantong[kId] = (pengeluaranPerKantong[kId] || 0) + amt

        // Jika transaksi terjadi hari ini dan berada di kantong daily
        const isDailyPocket = matchedPocket?.isDaily || kId === dailyKantong?.id
        if (t.tanggal === today && isDailyPocket) {
          pengeluaranDailyHariIni += amt
        }
      })

    setSummary({
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
      pengeluaranHariIni,
      pengeluaranPerKantong,
      pengeluaranDailyHariIni,
    })
  }, [profile])

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    setLoading(true)

    if (isGuest) {
      const saved = localStorage.getItem(GUEST_TX_KEY)
      const data = saved ? JSON.parse(saved) : DEFAULT_GUEST_TX
      if (!saved) {
        localStorage.setItem(GUEST_TX_KEY, JSON.stringify(DEFAULT_GUEST_TX))
      }
      setTransactions(data)
      calcSummary(data)
      setLoading(false)
      return
    }

    try {
      const startOfMonth = getStartOfMonth()
      const endOfMonth = getEndOfMonth()

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('tanggal', startOfMonth)
        .lte('tanggal', endOfMonth)
        .order('tanggal', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
      calcSummary(data || [])
    } catch {
      setTransactions([])
      calcSummary([])
    } finally {
      setLoading(false)
    }
  }, [user, isGuest, calcSummary])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async ({ tipe, jumlah, kategori, catatan, tanggal, kantong_id }) => {
    if (!user) return

    if (isGuest) {
      const newTx = {
        id: 'tx-' + Date.now(),
        tipe,
        jumlah: Number(jumlah),
        kategori,
        catatan: catatan || '',
        tanggal: tanggal || new Date().toISOString().split('T')[0],
        kantong_id: kantong_id || null,
      }
      const updated = [newTx, ...transactions]
      setTransactions(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_TX_KEY, JSON.stringify(updated))
      return
    }

    try {
      // Coba simpan dengan kantong_id jika kolom sudah ada di Supabase
      const payload = {
        user_id: user.id,
        tipe,
        jumlah: Number(jumlah),
        kategori,
        catatan: catatan || '',
        tanggal: tanggal || new Date().toISOString().split('T')[0],
      }
      if (kantong_id) {
        payload.kantong_id = kantong_id
      }
      const { error } = await supabase.from('transactions').insert(payload)
      if (error) {
        // Jika error kolom kantong_id belum ada, fallback tanpa kantong_id
        if (payload.kantong_id) {
          delete payload.kantong_id
          const { error: fallbackError } = await supabase.from('transactions').insert(payload)
          if (fallbackError) throw fallbackError
        } else {
          throw error
        }
      }
    } catch (err) {
      console.warn('addTransaction error:', err)
      throw err
    }
    await fetchTransactions()
  }

  const deleteTransaction = async (id) => {
    if (isGuest) {
      const updated = transactions.filter((t) => t.id !== id)
      setTransactions(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_TX_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchTransactions()
  }

  return {
    transactions,
    loading,
    summary,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
  }
}
