import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import {
  formatRupiah,
  formatTanggal,
  KATEGORI_PEMASUKAN,
  KATEGORI_PENGELUARAN,
} from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Plus,
  Loader2,
  Calendar,
} from 'lucide-react'

export default function TransactionsPage() {
  const {
    transactions,
    loading,
    summary,
    addTransaction,
    deleteTransaction,
  } = useTransactions()

  const [tipe, setTipe] = useState('pengeluaran')
  const [jumlah, setJumlah] = useState('')
  const [kategori, setKategori] = useState(KATEGORI_PENGELUARAN[0])
  const [catatan, setCatatan] = useState('')
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('semua')

  const categories =
    tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN

  const handleTipeChange = (newTipe) => {
    setTipe(newTipe)
    setKategori(
      newTipe === 'pemasukan' ? KATEGORI_PEMASUKAN[0] : KATEGORI_PENGELUARAN[0]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jumlah || Number(jumlah) <= 0) return
    setSubmitting(true)
    try {
      await addTransaction({
        tipe,
        jumlah,
        kategori,
        catatan,
        tanggal,
      })
      setJumlah('')
      setCatatan('')
    } catch (err) {
      alert('Gagal menyimpan: ' + (err.message || 'Error'))
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = transactions.filter((tx) => {
    if (filter === 'pemasukan') return tx.tipe === 'pemasukan'
    if (filter === 'pengeluaran') return tx.tipe === 'pengeluaran'
    return true
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Catat & Riwayat Transaksi</h1>
        <p className="text-sm text-muted-foreground">
          Kelola arus kas keluar masukmu
        </p>
      </div>

      {/* Quick Input Form */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Tipe Selector */}
          <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTipeChange('pengeluaran')}
              className={`py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                tipe === 'pengeluaran'
                  ? 'bg-card text-red-600 shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => handleTipeChange('pemasukan')}
              className={`py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                tipe === 'pemasukan'
                  ? 'bg-card text-emerald-600 shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Pemasukan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Nominal */}
            <div>
              <Label className="text-xs text-muted-foreground">Nominal (Rp)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="pl-10 text-lg font-bold"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Quick Category Chips */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Kategori
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setKategori(c)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      kategori === c
                        ? 'bg-primary text-primary-foreground border-primary font-medium shadow-xs'
                        : 'bg-card hover:bg-muted text-foreground border-border'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan & Tanggal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Catatan (opsional)</Label>
                <Input
                  type="text"
                  placeholder="mis: Makan siang warteg"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tanggal</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Catat {tipe === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter Tabs & List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Riwayat Bulan Ini</h2>
          <div className="flex gap-1 bg-muted p-0.5 rounded-lg text-xs">
            {['semua', 'pengeluaran', 'pemasukan'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                  filter === f
                    ? 'bg-card text-foreground font-medium shadow-xs'
                    : 'text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Tidak ada transaksi ditemukan.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => (
              <Card key={tx.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      tx.tipe === 'pemasukan'
                        ? 'bg-emerald-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {tx.tipe === 'pemasukan' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{tx.kategori}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {tx.tipe}
                      </Badge>
                    </div>
                    {tx.catatan && (
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.catatan}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {formatTanggal(tx.tanggal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        tx.tipe === 'pemasukan'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }`}
                    >
                      {tx.tipe === 'pemasukan' ? '+' : '-'}
                      {formatRupiah(tx.jumlah)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTransaction(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
