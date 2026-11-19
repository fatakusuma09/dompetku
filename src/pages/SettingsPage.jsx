import { useState, useEffect } from 'react'
import { useAuth, getKantongListFromProfile } from '@/contexts/AuthContext'
import {
  formatRupiah,
  formatNumberWithDots,
  parseFormattedNumber,
  DEFAULT_KANTONG,
  KANTONG_EMOJI_OPTIONS,
} from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Wallet,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  PieChart,
  Sparkles,
  Plus,
  Trash2,
  Star,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, updateProfile, signOut } = useAuth()

  const [namaLengkap, setNamaLengkap] = useState('')
  const [budgetBulanan, setBudgetBulanan] = useState('')
  const [batasHarian, setBatasHarian] = useState('')

  // Kustomisasi Kantong Budget State
  const [kantongList, setKantongList] = useState(DEFAULT_KANTONG)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newNama, setNewNama] = useState('')
  const [newIcon, setNewIcon] = useState('📦')
  const [newAlokasi, setNewAlokasi] = useState('')
  const [newIsDaily, setNewIsDaily] = useState(false)

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
      const list = getKantongListFromProfile(profile)
      setKantongList(
        list.map((k) => ({
          ...k,
          _rawVal: k.alokasi ? formatNumberWithDots(k.alokasi) : '',
        }))
      )
    }
  }, [profile])

  const totalBudgetNum = parseFormattedNumber(budgetBulanan)
  const totalPosNum = kantongList.reduce(
    (sum, k) => sum + (parseFormattedNumber(k._rawVal ?? k.alokasi) || 0),
    0
  )

  const handleAutoDivide = () => {
    if (totalBudgetNum <= 0) {
      alert('Masukkan Total Target Budget Bulanan terlebih dahulu!')
      return
    }
    const n = kantongList.length
    if (n === 0) return

    // Jika ada kantong daily (makan), beri porsi lebih besar (40-50%)
    const dailyIndex = kantongList.findIndex((k) => k.isDaily)
    let updated = []

    if (dailyIndex !== -1 && n > 1) {
      const dailyPortion = Math.round((totalBudgetNum * 0.45) / 1000) * 1000
      const remainingForOthers = totalBudgetNum - dailyPortion
      const otherPortion = Math.floor(remainingForOthers / (n - 1) / 1000) * 1000

      updated = kantongList.map((k, idx) => {
        let alokasi = 0
        if (idx === dailyIndex) {
          alokasi = dailyPortion
        } else if (idx === n - 1 && dailyIndex !== n - 1) {
          alokasi = totalBudgetNum - (dailyPortion + otherPortion * (n - 2))
        } else {
          alokasi = otherPortion
        }
        return { ...k, alokasi, _rawVal: formatNumberWithDots(alokasi) }
      })
    } else {
      const portion = Math.floor(totalBudgetNum / n / 1000) * 1000
      updated = kantongList.map((k, idx) => {
        const alokasi = idx === n - 1 ? totalBudgetNum - portion * (n - 1) : portion
        return { ...k, alokasi, _rawVal: formatNumberWithDots(alokasi) }
      })
    }

    setKantongList(updated)
  }

  const handleUpdateKantongAlokasi = (id, val) => {
    const formatted = formatNumberWithDots(val)
    setKantongList(
      kantongList.map((k) =>
        k.id === id
          ? {
              ...k,
              alokasi: parseFormattedNumber(formatted),
              _rawVal: formatted,
            }
          : k
      )
    )
  }

  const handleUpdateKantongNama = (id, newNamaVal) => {
    setKantongList(
      kantongList.map((k) => (k.id === id ? { ...k, nama: newNamaVal } : k))
    )
  }

  const handleToggleDaily = (id) => {
    setKantongList(
      kantongList.map((k) => ({
        ...k,
        isDaily: k.id === id ? !k.isDaily : false,
      }))
    )
  }

  const handleDeleteKantong = (id) => {
    if (kantongList.length <= 1) {
      alert('Minimal harus ada 1 kantong budget!')
      return
    }
    setKantongList(kantongList.filter((k) => k.id !== id))
  }

  const handleAddKantong = (e) => {
    e.preventDefault()
    if (!newNama.trim()) {
      alert('Nama kantong tidak boleh kosong')
      return
    }
    const newK = {
      id: 'k_' + Date.now(),
      nama: newNama.trim(),
      icon: newIcon || '📦',
      alokasi: parseFormattedNumber(newAlokasi) || 0,
      _rawVal: newAlokasi ? formatNumberWithDots(newAlokasi) : '',
      isDaily: newIsDaily,
    }

    let updated = [...kantongList]
    if (newIsDaily) {
      updated = updated.map((k) => ({ ...k, isDaily: false }))
    }
    updated.push(newK)

    setKantongList(updated)
    setNewNama('')
    setNewAlokasi('')
    setNewIsDaily(false)
    setShowAddForm(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      const sanitizedKantong = kantongList.map((k) => ({
        id: k.id,
        nama: k.nama || 'Kantong',
        icon: k.icon || '📦',
        alokasi: parseFormattedNumber(k._rawVal ?? k.alokasi),
        isDaily: Boolean(k.isDaily),
      }))

      await updateProfile({
        nama_lengkap: namaLengkap,
        budget_bulanan: parseFormattedNumber(budgetBulanan),
        batas_harian: parseFormattedNumber(batasHarian),
        pos_budget: {
          kantong_list: sanitizedKantong,
        },
      })
      setSuccess('Pengaturan dan kustomisasi kantong berhasil disimpan!')
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

        {/* Pos / Kantong Budget Card (Kustomisasi) */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Pos / Kantong Budget (Amplop)</CardTitle>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoDivide}
                  className="text-xs h-8 gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Bagi Otomatis
                </Button>
                <Button
                  type="button"
                  variant={showAddForm ? 'secondary' : 'default'}
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="text-xs h-8 gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {showAddForm ? 'Tutup Form' : 'Tambah Kantong'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Atur dan kustomisasi sendiri pos keuanganmu. Tandai satu kantong dengan icon bintang (⭐) sebagai tolok ukur batas harian (Safe-to-Spend).
            </p>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {/* Form Tambah Kantong Baru */}
            {showAddForm && (
              <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-primary" /> Buat Kantong Baru
                  </h4>
                  <span className="text-[10px] text-muted-foreground">Kustomisasi sesukamu</span>
                </div>

                {/* Pilih Emoji */}
                <div>
                  <Label className="text-[11px] text-muted-foreground">Pilih Icon Emoji</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {KANTONG_EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewIcon(em)}
                        className={`h-7 w-7 rounded-lg text-sm flex items-center justify-center border transition-all ${
                          newIcon === em
                            ? 'bg-primary/20 border-primary scale-110 shadow-xs'
                            : 'bg-background hover:bg-muted border-border'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Nama Kantong</Label>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-base p-1.5 bg-background border rounded-md">{newIcon}</span>
                      <Input
                        type="text"
                        placeholder="mis: Skincare, Bensin, Ngopi..."
                        value={newNama}
                        onChange={(e) => setNewNama(e.target.value)}
                        className="text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Alokasi Budget (Rp)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-2.5 top-2 text-xs font-semibold text-muted-foreground">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={newAlokasi}
                        onChange={(e) => setNewAlokasi(formatNumberWithDots(e.target.value))}
                        className="pl-8 text-xs font-semibold bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkbox Tolok Ukur Harian */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-background border">
                  <div className="flex items-center gap-2">
                    <Star className={`h-4 w-4 ${newIsDaily ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-xs font-medium">Jadikan Tolok Ukur Batas Harian</p>
                      <p className="text-[10px] text-muted-foreground">
                        Jika aktif, pengeluaran harian hanya dihitung dari kantong ini.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newIsDaily}
                    onChange={(e) => setNewIsDaily(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs h-7"
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddKantong}
                    className="text-xs h-7 gap-1"
                  >
                    <Plus className="h-3 w-3" /> Tambahkan
                  </Button>
                </div>
              </div>
            )}

            {/* List Kantong yang Ada */}
            <div className="space-y-2.5">
              {kantongList.map((k) => (
                <div
                  key={k.id}
                  className={`p-3 rounded-xl border transition-all ${
                    k.isDaily
                      ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                      : 'bg-card border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <span className="text-lg p-1.5 rounded-lg bg-muted/80 border shrink-0">
                        {k.icon || '📦'}
                      </span>
                      <Input
                        type="text"
                        value={k.nama}
                        onChange={(e) => handleUpdateKantongNama(k.id, e.target.value)}
                        placeholder="Nama Pos"
                        className="text-xs font-semibold h-8 bg-background max-w-[220px]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Button / Toggle Daily */}
                      <button
                        type="button"
                        onClick={() => handleToggleDaily(k.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-all ${
                          k.isDaily
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        }`}
                        title={k.isDaily ? 'Kantong ini adalah patokan batas harian' : 'Klik untuk jadikan patokan batas harian'}
                      >
                        <Star
                          className={`h-3 w-3 ${
                            k.isDaily ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'
                          }`}
                        />
                        {k.isDaily ? 'Tolok Ukur Harian' : 'Set Harian'}
                      </button>

                      {/* Delete Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKantong(k.id)}
                        disabled={kantongList.length <= 1}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Hapus Kantong"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Input Alokasi */}
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-semibold text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={k._rawVal !== undefined ? k._rawVal : formatNumberWithDots(k.alokasi)}
                      onChange={(e) => handleUpdateKantongAlokasi(k.id, e.target.value)}
                      placeholder="0"
                      className="pl-9 text-xs font-bold bg-background h-8"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Status Alokasi Pos */}
            {totalPosNum > 0 && (
              <div className="p-3 rounded-lg bg-muted/60 border text-xs space-y-1 mt-3">
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
