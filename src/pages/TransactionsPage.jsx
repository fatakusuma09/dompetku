import { useState, useEffect } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAuth, getKantongListFromProfile } from '@/contexts/AuthContext'
import {
  formatRupiah,
  formatTanggal,
  formatNumberWithDots,
  parseFormattedNumber,
  KATEGORI_PEMASUKAN,
  KATEGORI_PENGELUARAN,
  getMatchingKantong,
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
  const { profile } = useAuth()
  const kantongList = getKantongListFromProfile(profile)

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
  const [selectedKantongId, setSelectedKantongId] = useState('')
  const [catatan, setCatatan] = useState('')
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('semua')

  const categories =
    tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN

  // Auto-sync kantong id saat kategori berubah
  const handleCategorySelect = (cat) => {
    setKategori(cat)
    if (tipe === 'pengeluaran') {
      const match = getMatchingKantong(cat, kantongList)
      if (match) setSelectedKantongId(match.id)
    }
  }

  const handleTipeChange = (newTipe) => {
    setTipe(newTipe)
    const initialCat = newTipe === 'pemasukan' ? KATEGORI_PEMASUKAN[0] : KATEGORI_PENGELUARAN[0]
    setKategori(initialCat)
    if (newTipe === 'pengeluaran') {
      const match = getMatchingKantong(initialCat, kantongList)
      if (match) setSelectedKantongId(match.id)
    }
  }

  useEffect(() => {
    if (!selectedKantongId && kantongList.length > 0 && tipe === 'pengeluaran') {
      const match = getMatchingKantong(kategori, kantongList)
      setSelectedKantongId(match?.id || kantongList[0].id)
    }
  }, [kantongList, kategori, tipe, selectedKantongId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numericJumlah = parseFormattedNumber(jumlah)
    if (!numericJumlah || numericJumlah <= 0) {
      alert('Masukkan nominal yang valid')
      return
    }

    setSubmitting(true)
    try {
      await addTransaction({
        tipe,
        jumlah: numericJumlah,
        kategori,
        catatan,
        tanggal,
        kantong_id:
          tipe === 'pengeluaran'
            ? selectedKantongId || getMatchingKantong(kategori, kantongList)?.id
            : null,
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

  // Cari kantong aktif yang terpilih untuk info badge
  const activeKantong =
    kantongList.find((k) => k.id === selectedKantongId) ||
    getMatchingKantong(kategori, kantongList)

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
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={jumlah}
                  onChange={(e) => setJumlah(formatNumberWithDots(e.target.value))}
                  className="pl-10 text-lg font-bold"
                  required
                />
              </div>
            </div>

            {/* Quick Category Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-muted-foreground">Kategori</Label>
                {tipe === 'pengeluaran' && activeKantong && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium border bg-muted/60 flex items-center gap-1">
                    <span>Pos:</span>
                    <span>{activeKantong.icon}</span>
                    <span className="font-semibold text-foreground">{activeKantong.nama}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCategorySelect(c)}
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

            {/* Pos / Kantong Selector (Khusus Pengeluaran) */}
            {tipe === 'pengeluaran' && kantongList.length > 0 && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Bebankan ke Pos / Kantong Budget
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    Bisa dialihkan ke pos lain
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kantongList.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setSelectedKantongId(k.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg border flex items-center gap-1.5 transition-all ${
                        selectedKantongId === k.id
                          ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                          : 'bg-background hover:bg-muted text-foreground border-border'
                      }`}
                    >
                      <span>{k.icon || '📦'}</span>
                      <span>{k.nama}</span>
                      {k.isDaily && (
                        <span className="text-[9px] bg-amber-200/50 text-amber-900 dark:text-amber-200 px-1 py-0.2 rounded font-medium">
                          Harian
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
            {filtered.map((tx) => {
              const txKantong =
                tx.tipe === 'pengeluaran'
                  ? tx.kantong_id
                    ? kantongList.find((k) => k.id === tx.kantong_id) || {
                        nama: tx.kategori,
                        icon: '📦',
                      }
                    : getMatchingKantong(tx.kategori, kantongList)
                  : null

              return (
                <Card key={tx.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        tx.tipe === 'pemasukan' ? 'bg-emerald-100' : 'bg-red-100'
                      }`}
                    >
                      {tx.tipe === 'pemasukan' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium">{tx.kategori}</span>
                        {tx.tipe === 'pengeluaran' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-muted/70 font-medium flex items-center gap-1">
                            <span>{txKantong?.icon || '📦'}</span>
                            <span>{txKantong?.nama || tx.kategori}</span>
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {tx.tipe}
                          </Badge>
                        )}
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
                          tx.tipe === 'pemasukan' ? 'text-emerald-600' : 'text-red-600'
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
