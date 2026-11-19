import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatRupiah,
  formatNumberWithDots,
  parseFormattedNumber,
  KANTONG_CONFIG,
} from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Wallet,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  PieChart,
  Sparkles,
  Utensils,
  Repeat,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth()

  const [namaLengkap, setNamaLengkap] = useState('')
  const [budgetBulanan, setBudgetBulanan] = useState('')
  const [batasHarian, setBatasHarian] = useState('')

  // Pos / Kantong Budget State
  const [posMakan, setPosMakan] = useState('')
  const [posRutin, setPosRutin] = useState('')
  const [posUrgensi, setPosUrgensi] = useState('')
  const [posLainnya, setPosLainnya] = useState('')

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (profile) {
      setNamaLengkap(profile.nama_lengkap || '')
      setBudgetBulanan(
        profile.budget_bulanan && Number(profile.budget_bulanan) > 0
          ? formatNumberWithDots(profile.budget_bulanan)
          : ''
      )
      setBatasHarian(
        profile.batas_harian && Number(profile.batas_harian) > 0
          ? formatNumberWithDots(profile.batas_harian)
          : ''
      )

      const pb = profile.pos_budget || {}
      setPosMakan(pb.makan && Number(pb.makan) > 0 ? formatNumberWithDots(pb.makan) : '')
      setPosRutin(pb.rutin && Number(pb.rutin) > 0 ? formatNumberWithDots(pb.rutin) : '')
      setPosUrgensi(pb.urgensi && Number(pb.urgensi) > 0 ? formatNumberWithDots(pb.urgensi) : '')
      setPosLainnya(pb.lainnya && Number(pb.lainnya) > 0 ? formatNumberWithDots(pb.lainnya) : '')
    }
  }, [profile])

  const totalBudgetNum = parseFormattedNumber(budgetBulanan)
  const totalPosNum =
    parseFormattedNumber(posMakan) +
    parseFormattedNumber(posRutin) +
    parseFormattedNumber(posUrgensi) +
    parseFormattedNumber(posLainnya)

  const handleAutoDivide = () => {
    if (totalBudgetNum <= 0) {
      alert('Masukkan Total Target Budget Bulanan terlebih dahulu!')
      return
    }
    // Proporsi Mahasiswa: 50% Makan, 25% Rutin, 15% Urgensi, 10% Lainnya
    const makan = Math.round((totalBudgetNum * 0.5) / 1000) * 1000
    const rutin = Math.round((totalBudgetNum * 0.25) / 1000) * 1000
    const urgensi = Math.round((totalBudgetNum * 0.15) / 1000) * 1000
    const lainnya = totalBudgetNum - (makan + rutin + urgensi)

    setPosMakan(formatNumberWithDots(makan))
    setPosRutin(formatNumberWithDots(rutin))
    setPosUrgensi(formatNumberWithDots(urgensi))
    setPosLainnya(formatNumberWithDots(lainnya))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      await updateProfile({
        nama_lengkap: namaLengkap,
        budget_bulanan: parseFormattedNumber(budgetBulanan),
        batas_harian: parseFormattedNumber(batasHarian),
        pos_budget: {
          makan: parseFormattedNumber(posMakan),
          rutin: parseFormattedNumber(posRutin),
          urgensi: parseFormattedNumber(posUrgensi),
          lainnya: parseFormattedNumber(posLainnya),
        },
      })
      setSuccess('Pengaturan berhasil disimpan!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert('Gagal update: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil dan target keuanganmu
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Profil */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Profil Pengguna</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="mt-1 bg-muted cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Email terhubung dengan akun Supabase Auth.
              </p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Nama Lengkap</Label>
              <Input
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama kamu"
                className="mt-1"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Daily Limit Setting */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Target Budget & Batas Harian</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Target Budget Bulanan (Rp)
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={budgetBulanan}
                  onChange={(e) => setBudgetBulanan(formatNumberWithDots(e.target.value))}
                  placeholder="0"
                  className="pl-10 text-base font-bold"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Alokasi maksimal pengeluaran sebulan.
              </p>
            </div>

            <div className="pt-3 border-t">
              <Label className="text-xs text-muted-foreground">
                Batas Pengeluaran Harian Kustom (Rp)
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={batasHarian}
                  onChange={(e) => setBatasHarian(formatNumberWithDots(e.target.value))}
                  placeholder="0"
                  className="pl-10 text-base font-bold"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Isi <strong>0</strong> jika ingin dihitung otomatis oleh sistem (sisa budget dibagi sisa hari). Masukkan nominal tertentu (misal: <em>Rp 50.000</em>) untuk membatasi pengeluaran per hari secara manual.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pos / Kantong Budget Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Pos / Kantong Budget (Metode Amplop)</CardTitle>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoDivide}
                className="text-xs h-7 gap-1"
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                Bagi Otomatis (50/25/15/10)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bagi uangmu ke pos terpisah agar jatah makan harian tidak terpotong saat ada servis motor atau laundry.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 1. Makan */}
            <div className="p-2.5 rounded-lg border bg-amber-50/40 border-amber-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                    <Utensils className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground">
                      🍔 Makan & Jajan (Harian)
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Makanan, warteg, ngopi, kuliner (Terhubung ke batas harian)
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={posMakan}
                  onChange={(e) => setPosMakan(formatNumberWithDots(e.target.value))}
                  placeholder="0"
                  className="pl-10 text-sm font-bold bg-background"
                />
              </div>
            </div>

            {/* 2. Rutin */}
            <div className="p-2.5 rounded-lg border bg-blue-50/40 border-blue-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-800">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground">
                      🛵 Kebutuhan Rutin & Kuliah
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Bensin, laundry, kos/sewa, print tugas, pulsa/internet
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={posRutin}
                  onChange={(e) => setPosRutin(formatNumberWithDots(e.target.value))}
                  placeholder="0"
                  className="pl-10 text-sm font-bold bg-background"
                />
              </div>
            </div>

            {/* 3. Urgensi */}
            <div className="p-2.5 rounded-lg border bg-rose-50/40 border-rose-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-rose-100 text-rose-800">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground">
                      🚨 Dana Urgensi & Darurat
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Servis motor, tambal ban, obat/sakit, keperluan mendesak
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={posUrgensi}
                  onChange={(e) => setPosUrgensi(formatNumberWithDots(e.target.value))}
                  placeholder="0"
                  className="pl-10 text-sm font-bold bg-background"
                />
              </div>
            </div>

            {/* 4. Lainnya */}
            <div className="p-2.5 rounded-lg border bg-purple-50/40 border-purple-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-100 text-purple-800">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-foreground">
                      🛍️ Belanja & Lain-lain
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Belanja keperluan pribadi & pengeluaran variatif
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={posLainnya}
                  onChange={(e) => setPosLainnya(formatNumberWithDots(e.target.value))}
                  placeholder="0"
                  className="pl-10 text-sm font-bold bg-background"
                />
              </div>
            </div>

            {/* Status Alokasi Pos */}
            {totalPosNum > 0 && (
              <div className="p-3 rounded-lg bg-muted/60 border text-xs space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Total Terbagi ke Pos:</span>
                  <span className="font-bold text-foreground">{formatRupiah(totalPosNum)}</span>
                </div>
                {totalBudgetNum > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Target Budget Bulanan:</span>
                    <span>{formatRupiah(totalBudgetNum)}</span>
                  </div>
                )}
                {totalBudgetNum > 0 && totalPosNum === totalBudgetNum && (
                  <p className="text-emerald-600 font-semibold text-[11px] pt-1">
                    ✅ Alokasi pos sudah 100% pas dengan target budget bulanan!
                  </p>
                )}
                {totalBudgetNum > 0 && totalPosNum < totalBudgetNum && (
                  <p className="text-amber-600 font-medium text-[11px] pt-1">
                    ℹ️ Sisa belum dialokasikan ke pos: {formatRupiah(totalBudgetNum - totalPosNum)}
                  </p>
                )}
                {totalBudgetNum > 0 && totalPosNum > totalBudgetNum && (
                  <p className="text-destructive font-medium text-[11px] pt-1">
                    ⚠️ Total pos melebihi target budget sebesar {formatRupiah(totalPosNum - totalBudgetNum)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Simpan Perubahan
        </Button>
      </form>

      <Separator />

      {/* Logout */}
      <Card className="border-destructive/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-destructive">Keluar Akun</p>
            <p className="text-xs text-muted-foreground">
              Akhiri sesi login di perangkat ini
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
