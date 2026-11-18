import { useState } from 'react'
import { useDebts } from '@/hooks/useDebts'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Handshake,
  Plus,
  CheckCircle2,
  Trash2,
  Loader2,
  User,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react'

export default function DebtsPage() {
  const {
    allDebts,
    summary,
    loading,
    addDebt,
    settleDebt,
    deleteDebt,
  } = useDebts()

  const [tab, setTab] = useState('aktif')
  const [showAdd, setShowAdd] = useState(false)
  const [tipe, setTipe] = useState('hutang') // 'hutang' (saya pinjam) | 'piutang' (orang pinjam ke saya)
  const [namaOrang, setNamaOrang] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [catatan, setCatatan] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!namaOrang || !jumlah || Number(jumlah) <= 0) return
    setSubmitting(true)
    try {
      await addDebt({
        tipe,
        nama_orang: namaOrang,
        jumlah,
        catatan,
      })
      setNamaOrang('')
      setJumlah('')
      setCatatan('')
      setShowAdd(false)
    } catch (err) {
      alert('Gagal menambah hutang: ' + (err.message || 'Error'))
    } finally {
      setSubmitting(false)
    }
  }

  const activeDebts = allDebts.filter((d) => !d.lunas)
  const settledDebts = allDebts.filter((d) => d.lunas)

  const displayedList = tab === 'aktif' ? activeDebts : settledDebts

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Catatan Hutang & Piutang</h1>
          <p className="text-sm text-muted-foreground">
            Lacak siapa pinjam ke kamu & kamu pinjam ke siapa
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
          variant={showAdd ? 'outline' : 'default'}
        >
          {showAdd ? 'Tutup' : '+ Catat'}
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-red-200 bg-red-50/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Saya Berhutang
                </p>
                <p className="text-lg font-bold text-red-600">
                  {formatRupiah(summary.totalHutang)}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Piutang Saya
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatRupiah(summary.totalPiutang)}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Add Debt (Collapsible) */}
      {showAdd && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm">Catat Baru</h3>

            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTipe('hutang')}
                className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                  tipe === 'hutang'
                    ? 'bg-card text-red-600 shadow-xs'
                    : 'text-muted-foreground'
                }`}
              >
                Saya Berhutang (Kewajiban)
              </button>
              <button
                type="button"
                onClick={() => setTipe('piutang')}
                className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                  tipe === 'piutang'
                    ? 'bg-card text-emerald-600 shadow-xs'
                    : 'text-muted-foreground'
                }`}
              >
                Orang Berhutang (Hak Saya)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Nama Teman / Pihak</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="mis: Budi, Bu Kos, Rental"
                    value={namaOrang}
                    onChange={(e) => setNamaOrang(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Jumlah (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="mt-1 font-semibold"
                  required
                  min="1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Keterangan / Catatan</Label>
                <Input
                  placeholder="mis: Talangan fotocopy / jajan"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Simpan Catatan
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tabs Aktif vs Lunas */}
      <div className="flex border-b text-sm">
        <button
          onClick={() => setTab('aktif')}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 -mb-px ${
            tab === 'aktif'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Belum Selesai ({activeDebts.length})
        </button>
        <button
          onClick={() => setTab('lunas')}
          className={`pb-2 px-4 font-medium transition-colors border-b-2 -mb-px ${
            tab === 'lunas'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Sudah Lunas ({settledDebts.length})
        </button>
      </div>

      {/* Debt List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : displayedList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {tab === 'aktif'
              ? 'Tidak ada catatan hutang/piutang yang aktif. Aman tentram!'
              : 'Belum ada riwayat hutang/piutang yang diselesaikan.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayedList.map((d) => (
            <Card key={d.id} className="hover:border-primary/20 transition-colors shadow-xs">
              <CardContent className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      d.lunas
                        ? 'bg-muted text-muted-foreground'
                        : d.tipe === 'hutang'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {d.nama_orang}
                      </span>
                      <Badge
                        variant={
                          d.lunas
                            ? 'secondary'
                            : d.tipe === 'hutang'
                            ? 'destructive'
                            : 'success'
                        }
                        className="text-[10px] py-0"
                      >
                        {d.lunas
                          ? 'Lunas'
                          : d.tipe === 'hutang'
                          ? 'Saya Hutang'
                          : 'Piutang'}
                      </Badge>
                    </div>
                    {d.catatan && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {d.catatan}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatTanggal(d.tanggal)}
                      {d.tanggal_lunas && ` • Lunas: ${formatTanggal(d.tanggal_lunas)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-0 border-border/40 shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      d.lunas
                        ? 'text-muted-foreground line-through'
                        : d.tipe === 'hutang'
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatRupiah(d.jumlah)}
                  </p>

                  <div className="flex items-center gap-1.5">
                    {!d.lunas && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => settleDebt(d.id)}
                        title="Tandai Lunas"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                        Lunas
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteDebt(d.id)}
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
