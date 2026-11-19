import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Wallet, LogOut, Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth()

  const [namaLengkap, setNamaLengkap] = useState('')
  const [budgetBulanan, setBudgetBulanan] = useState('')
  const [batasHarian, setBatasHarian] = useState('')
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
    }
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      await updateProfile({
        nama_lengkap: namaLengkap,
        budget_bulanan: parseFormattedNumber(budgetBulanan),
        batas_harian: parseFormattedNumber(batasHarian),
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
              {budgetBulanan && parseFormattedNumber(budgetBulanan) > 0 && (
                <p className="text-xs text-primary font-semibold mt-1">
                  Format: {formatRupiah(parseFormattedNumber(budgetBulanan))}
                </p>
              )}
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
              {batasHarian && parseFormattedNumber(batasHarian) > 0 && (
                <p className="text-xs text-primary font-semibold mt-1">
                  Format: {formatRupiah(parseFormattedNumber(batasHarian))} / hari
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                Isi <strong>0</strong> jika ingin dihitung otomatis oleh sistem (sisa budget dibagi sisa hari). Masukkan nominal tertentu (misal: <em>Rp 50.000</em>) untuk membatasi pengeluaran per hari secara manual.
              </p>
            </div>
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
