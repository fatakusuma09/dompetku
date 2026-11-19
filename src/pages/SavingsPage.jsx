import { useState } from 'react'
import { useSavingsGoals } from '@/hooks/useSavingsGoals'
import {
  formatRupiah,
  formatTanggal,
  formatNumberWithDots,
  parseFormattedNumber,
} from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle,
  Coins,
  Sparkles,
} from 'lucide-react'

const COLOR_OPTIONS = [
  { label: 'Hijau', value: '#059669' },
  { label: 'Biru', value: '#2563eb' },
  { label: 'Kuning', value: '#d97706' },
  { label: 'Ungu', value: '#7c3aed' },
  { label: 'Merah Muda', value: '#db2777' },
]

export default function SavingsPage() {
  const { goals, loading, summary, addGoal, depositSavings, deleteGoal } =
    useSavingsGoals()

  const [showAdd, setShowAdd] = useState(false)
  const [namaTarget, setNamaTarget] = useState('')
  const [targetJumlah, setTargetJumlah] = useState('')
  const [deadline, setDeadline] = useState('')
  const [warna, setWarna] = useState(COLOR_OPTIONS[0].value)
  const [submitting, setSubmitting] = useState(false)

  // Deposit modal/inline state
  const [depositGoalId, setDepositGoalId] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const numericTarget = parseFormattedNumber(targetJumlah)
    if (!namaTarget || !numericTarget || numericTarget <= 0) return
    setSubmitting(true)
    try {
      await addGoal({
        nama_target: namaTarget,
        target_jumlah: numericTarget,
        deadline: deadline || null,
        warna,
      })
      setNamaTarget('')
      setTargetJumlah('')
      setDeadline('')
      setShowAdd(false)
    } catch (err) {
      alert('Gagal menambah target: ' + (err.message || 'Error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeposit = async (id) => {
    const numericDeposit = parseFormattedNumber(depositAmount)
    if (!numericDeposit || numericDeposit <= 0) return
    setDepositing(true)
    try {
      await depositSavings(id, numericDeposit)
      setDepositGoalId(null)
      setDepositAmount('')
    } catch (err) {
      alert('Gagal menabung: ' + (err.message || 'Error'))
    } finally {
      setDepositing(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Target Menabung</h1>
          <p className="text-sm text-muted-foreground">
            Wujudkan impian & kebutuhan kampusmu setahap demi setahap
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
          variant={showAdd ? 'outline' : 'default'}
        >
          {showAdd ? 'Tutup' : '+ Target Baru'}
        </Button>
      </div>

      {/* Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-emerald-50/60 to-background shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Tabungan Terkumpul
                </p>
                <p className="text-xl font-bold text-primary">
                  {formatRupiah(summary.totalTerkumpul)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Dari Total Target</p>
              <p className="text-sm font-semibold text-foreground">
                {formatRupiah(summary.totalTarget)}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Capaian Keseluruhan</span>
              <span className="font-semibold text-primary">
                {summary.persentaseTotal}%
              </span>
            </div>
            <Progress value={summary.persentaseTotal} />
          </div>
        </CardContent>
      </Card>

      {/* Add Goal Form (Collapsible) */}
      {showAdd && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Buat Target Tabungan Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Nama Target
                </Label>
                <Input
                  placeholder="mis: Beli Laptop Baru, UKT Semester 4, Liburan"
                  value={namaTarget}
                  onChange={(e) => setNamaTarget(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Target Nominal (Rp)
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={targetJumlah}
                      onChange={(e) => setTargetJumlah(formatNumberWithDots(e.target.value))}
                      className="pl-10 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tenggat Waktu / Deadline (Opsional)
                  </Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Pilih Tema Warna
                </Label>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setWarna(c.value)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        warna === c.value
                          ? 'scale-110 border-foreground shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Simpan Target
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Belum ada target menabung. Mulai pasang impian pertamamu!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const percent = Math.min(
              Math.round((Number(g.terkumpul) / Number(g.target_jumlah)) * 100),
              100
            )
            const sisa = Math.max(
              Number(g.target_jumlah) - Number(g.terkumpul),
              0
            )
            const isCompleted = g.selesai || percent >= 100

            return (
              <Card
                key={g.id}
                className="overflow-hidden border-border/80 hover:border-primary/30 transition-colors shadow-xs"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: g.warna || '#059669' }}
                />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-foreground">
                          {g.nama_target}
                        </h3>
                        {isCompleted ? (
                          <Badge variant="success" className="text-[10px]">
                            <CheckCircle className="h-3 w-3 mr-1" /> Tercapai
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            {percent}%
                          </Badge>
                        )}
                      </div>
                      {g.deadline && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Target: {formatTanggal(g.deadline)}
                        </p>
                      )}
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => deleteGoal(g.id)}
                      title="Hapus Target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-primary font-bold">
                        {formatRupiah(g.terkumpul)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatRupiah(g.target_jumlah)}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className="h-2.5"
                    />
                    {!isCompleted && (
                      <p className="text-[11px] text-muted-foreground text-right">
                        Sisa {formatRupiah(sisa)} lagi
                      </p>
                    )}
                  </div>

                  {/* Quick Deposit Section */}
                  {depositGoalId === g.id ? (
                    <div className="pt-2 border-t flex flex-col gap-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {[20000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(String(amt))}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground font-medium transition-colors"
                          >
                            +{formatRupiah(amt)}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Nominal simpanan (Rp)"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(formatNumberWithDots(e.target.value))}
                          className="h-9 text-xs font-semibold flex-1"
                          autoFocus
                        />
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            size="sm"
                            className="h-9 text-xs font-medium"
                            onClick={() => handleDeposit(g.id)}
                            disabled={depositing}
                          >
                            {depositing ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Nabung
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 text-xs"
                            onClick={() => {
                              setDepositGoalId(null)
                              setDepositAmount('')
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        variant={isCompleted ? 'outline' : 'default'}
                        className="h-8 text-xs font-medium"
                        onClick={() => {
                          setDepositGoalId(g.id)
                          setDepositAmount('')
                        }}
                      >
                        <Coins className="h-3.5 w-3.5 mr-1.5" />
                        {isCompleted ? 'Tambah Lagi' : '+ Nabung Sekarang'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
