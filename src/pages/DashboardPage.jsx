import { Link } from 'react-router-dom'
import { useTransactions } from '@/hooks/useTransactions'
import { useDebts } from '@/hooks/useDebts'
import { useSavingsGoals } from '@/hooks/useSavingsGoals'
import { useAuth } from '@/contexts/AuthContext'
import { formatRupiah, formatTanggal, getRemainingDays, getDayProgress } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  PiggyBank,
  ArrowRight,
  Loader2,
  Handshake,
  Target,
  Settings,
  AlertTriangle,
  Calculator,
} from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { transactions, loading: loadingTx, summary } = useTransactions()
  const { summary: debtSummary, loading: loadingDebt } = useDebts()
  const { goals, summary: savingsSummary, loading: loadingSavings } = useSavingsGoals()

  const remainingDays = getRemainingDays()
  const dayProgress = getDayProgress()
  const budgetBulanan = Number(profile?.budget_bulanan || 0)
  const batasHarianManual = Number(profile?.batas_harian || 0)

  const isManualLimit = batasHarianManual > 0
  const sisaBudget = budgetBulanan > 0 ? budgetBulanan - summary.totalPengeluaran : summary.saldo
  const batasHarianOtomatis = Math.max(Math.floor(sisaBudget / remainingDays), 0)
  const batasHarian = isManualLimit ? batasHarianManual : batasHarianOtomatis

  const pengeluaranHariIni = summary.pengeluaranHariIni || 0
  const sisaHariIni = Math.max(batasHarian - pengeluaranHariIni, 0)
  const isOverDailyLimit = batasHarian > 0 && pengeluaranHariIni > batasHarian
  const dailyUsedPercent = batasHarian > 0
    ? Math.min(Math.round((pengeluaranHariIni / batasHarian) * 100), 100)
    : 0
  const budgetUsedPercent = budgetBulanan > 0
    ? Math.min(Math.round((summary.totalPengeluaran / budgetBulanan) * 100), 100)
    : 0

  // Proyeksi sisa uang akhir bulan jika konsisten memakai batas harian
  // Hari ini sisa jatah belanja = sisaHariIni
  // Hari esok s/d akhir bulan = (remainingDays - 1) hari
  const hariSisaBulanDepan = Math.max(remainingDays - 1, 0)
  const totalRencanaKeluarSisaBulan = sisaHariIni + (hariSisaBulanDepan * batasHarian)
  const proyeksiSisaUangAkhirBulan = summary.saldo - totalRencanaKeluarSisaBulan
  const isDefisitAkhirBulan = proyeksiSisaUangAkhirBulan < 0

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  if (loadingTx || loadingDebt || loadingSavings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold">
          {greeting()}, {profile?.nama_lengkap?.split(' ')[0] || 'Kamu'}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatTanggal(new Date())}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Saldo</p>
                <p className={`text-lg font-bold ${summary.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatRupiah(summary.saldo)}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${summary.saldo >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <Wallet className={`h-5 w-5 ${summary.saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pemasukan</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatRupiah(summary.totalPemasukan)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pengeluaran</p>
                <p className="text-lg font-bold text-red-600">
                  {formatRupiah(summary.totalPengeluaran)}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Widgets Grid (PC 2-Cols, Mobile 1-Col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Safe-to-Spend Widget with Configurable Daily Limit */}
        <Card className={`border-primary/20 flex flex-col justify-between ${isOverDailyLimit ? 'bg-gradient-to-br from-red-50/70 to-background border-red-300' : 'bg-gradient-to-br from-emerald-50/50 to-background'}`}>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PiggyBank className={`h-5 w-5 ${isOverDailyLimit ? 'text-destructive' : 'text-primary'}`} />
                <h3 className="font-semibold text-sm">Batas Pengeluaran Harian</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={isManualLimit ? 'default' : 'outline'} className="text-[10px] py-0 px-1.5">
                  {isManualLimit ? 'Manual' : 'Otomatis'}
                </Badge>
                <Link
                  to="/pengaturan"
                  className="p-1 rounded-md text-muted-foreground hover:text-primary transition-colors"
                  title="Atur Batas Harian"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <div>
                <p className={`text-2xl sm:text-3xl font-bold ${isOverDailyLimit ? 'text-destructive' : 'text-primary'}`}>
                  {formatRupiah(batasHarian)}
                  <span className="text-xs font-normal text-muted-foreground ml-1.5">/ hari</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Hari ini terpakai</p>
                <p className={`text-sm font-bold ${isOverDailyLimit ? 'text-destructive' : 'text-foreground'}`}>
                  {formatRupiah(pengeluaranHariIni)}
                </p>
              </div>
            </div>

            {/* Daily Alert / Progress */}
            {isOverDailyLimit ? (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium my-2.5 border border-destructive/20">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Overbudget! Melebihi batas {formatRupiah(pengeluaranHariIni - batasHarian)}.</span>
              </div>
            ) : (
              <div className="space-y-1.5 my-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Sisa jatah belanja hari ini</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(sisaHariIni)}</span>
                </div>
                <Progress
                  value={dailyUsedPercent}
                  className={`h-2 ${dailyUsedPercent > 80 ? '[&>div]:bg-amber-500' : ''}`}
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {isManualLimit
                  ? `Limit kustom aktif • Sisa ${remainingDays} hari lagi di bulan ini`
                  : `Dihitung otomatis: sisa dana dibagi ${remainingDays} hari`}
              </span>
            </div>

            {/* Proyeksi Sisa Uang Akhir Bulan jika pakai batas harian */}
            {batasHarian > 0 && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-2.5 my-3 ${
                  isDefisitAkhirBulan
                    ? 'bg-red-50/90 border-red-200 text-red-900'
                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Calculator className="h-4 w-4" />
                    Simulasi S/D Akhir Bulan
                  </span>
                  <Badge
                    variant={isDefisitAkhirBulan ? 'destructive' : 'default'}
                    className="text-[10px] py-0 px-2"
                  >
                    {isDefisitAkhirBulan ? 'Waspada Defisit' : 'Aman (Surplus)'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-background/60 border border-border/40 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Sisa Hari di Bulan Ini:</span>
                    <span className="font-bold text-foreground text-xs">{remainingDays} hari</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Rencana Belanja:</span>
                    <span className="font-bold text-foreground text-xs">{formatRupiah(totalRencanaKeluarSisaBulan)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-background/90 border shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Estimasi Sisa Uang Akhir Bulan:
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      (Saldo saat ini - rencana belanja)
                    </p>
                  </div>
                  <span
                    className={`text-base font-extrabold ${
                      isDefisitAkhirBulan ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {proyeksiSisaUangAkhirBulan >= 0 ? '+' : ''}
                    {formatRupiah(proyeksiSisaUangAkhirBulan)}
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground leading-normal">
                  {isDefisitAkhirBulan
                    ? `⚠️ Jika belanja ${formatRupiah(batasHarian)}/hari selama ${remainingDays} hari ke depan, kamu diperkirakan tekor ${formatRupiah(Math.abs(proyeksiSisaUangAkhirBulan))} di akhir bulan.`
                    : `💡 Jika tertib belanja maksimal ${formatRupiah(batasHarian)}/hari selama ${remainingDays} hari ke depan, dompetmu masih aman dan tersisa ${formatRupiah(proyeksiSisaUangAkhirBulan)}.`}
                </p>
              </div>
            )}

            {budgetBulanan > 0 && (
              <div className="space-y-1.5 pt-2.5 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Budget bulanan terpakai</span>
                  <span className="font-medium">
                    {formatRupiah(summary.totalPengeluaran)} / {formatRupiah(budgetBulanan)}
                  </span>
                </div>
                <Progress
                  value={budgetUsedPercent}
                  className={budgetUsedPercent > 80 ? '[&>div]:bg-red-500' : ''}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Savings Summary Widget */}
        <Card className="flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Target Menabung</span>
                {goals.length > 0 && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    {goals.filter((g) => g.selesai).length}/{goals.length} Tercapai
                  </Badge>
                )}
              </div>
              <Link
                to="/tabungan"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Lihat Detail <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Terkumpul: {formatRupiah(savingsSummary.totalTerkumpul)}</span>
                <span className="font-semibold text-primary">{savingsSummary.persentaseTotal}%</span>
              </div>
              <Progress value={savingsSummary.persentaseTotal} />
            </div>

            {goals.length > 0 && (
              <div className="pt-2 flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(Math.round((g.terkumpul / g.target_jumlah) * 100), 100)
                  return (
                    <div
                      key={g.id}
                      className="shrink-0 p-2.5 rounded-lg bg-muted/60 border border-border/60 text-xs min-w-[140px]"
                    >
                      <p className="font-medium truncate text-foreground">{g.nama_target}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatRupiah(g.terkumpul)}
                      </p>
                      <div className="w-full bg-border rounded-full h-1 mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: g.warna || '#059669',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debt Summary */}
      {(debtSummary.totalHutang > 0 || debtSummary.totalPiutang > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Handshake className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Hutang & Piutang</span>
              </div>
              <Link
                to="/hutang"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Kelola <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-xs text-muted-foreground">Saya Hutang</p>
                <p className="text-sm font-bold text-red-600">
                  {formatRupiah(debtSummary.totalHutang)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs text-muted-foreground">Piutang Saya</p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatRupiah(debtSummary.totalPiutang)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Transaksi Terakhir</h3>
          <Link
            to="/transaksi"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Belum ada transaksi bulan ini. Mulai catat pengeluaranmu!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <Card key={tx.id}>
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
                    <p className="text-sm font-medium truncate">{tx.kategori}</p>
                    {tx.catatan && (
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.catatan}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
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
                    <p className="text-[10px] text-muted-foreground">
                      {formatTanggal(tx.tanggal)}
                    </p>
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
