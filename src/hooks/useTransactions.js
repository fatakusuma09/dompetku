import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getStartOfMonth, getEndOfMonth, getKantongForKategori } from '@/lib/utils'

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
  const { user, isGuest } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldo: 0,
    pengeluaranHariIni: 0,
    pengeluaranPerKantong: { makan: 0, rutin: 0, urgensi: 0, lainnya: 0 },
    pengeluaranMakanHariIni: 0,
  })

  const calcSummary = (data) => {
    const today = new Date().toISOString().split('T')[0]
    const list = data || []

    const totalPemasukan = list
      .filter((t) => t.tipe === 'pemasukan')
      .reduce((sum, t) => sum + Number(t.jumlah), 0)

    const totalPengeluaran = list
      .filter((t) => t.tipe === 'pengeluaran')
      .reduce((sum, t) => sum + Number(t.jumlah), 0)

    const pengeluaranHariIni = list
      .filter((t) => t.tipe === 'pengeluaran' && t.tanggal === today)
      .reduce((sum, t) => sum + Number(t.jumlah), 0)

    const pengeluaranPerKantong = { makan: 0, rutin: 0, urgensi: 0, lainnya: 0 }
    let pengeluaranMakanHariIni = 0

    list
      .filter((t) => t.tipe === 'pengeluaran')
      .forEach((t) => {
        const kantong = getKantongForKategori(t.kategori)
        const amt = Number(t.jumlah) || 0
        pengeluaranPerKantong[kantong.id] = (pengeluaranPerKantong[kantong.id] || 0) + amt
        if (t.tanggal === today && kantong.id === 'makan') {
          pengeluaranMakanHariIni += amt
        }
      })

    setSummary({
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran,
      pengeluaranHariIni,
      pengeluaranPerKantong,
      pengeluaranMakanHariIni,
    })
  }

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
  }, [user, isGuest])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async ({ tipe, jumlah, kategori, catatan, tanggal }) => {
    if (!user) return

    if (isGuest) {
      const newTx = {
        id: 'tx-' + Date.now(),
        tipe,
        jumlah: Number(jumlah),
        kategori,
        catatan: catatan || '',
        tanggal: tanggal || new Date().toISOString().split('T')[0],
      }
      const updated = [newTx, ...transactions]
      setTransactions(updated)
      calcSummary(updated)
      localStorage.setItem(GUEST_TX_KEY, JSON.stringify(updated))
      return
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      tipe,
      jumlah: Number(jumlah),
      kategori,
      catatan: catatan || '',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
    })
    if (error) throw error
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
