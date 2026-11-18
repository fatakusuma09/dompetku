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
} from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { transactions, loading: loadingTx, summary } = useTransactions()
  const { summary: debtSummary, loading: loadingDebt } = useDebts()
  const { goals, summary: savingsSummary, loading: loadingSavings } = useSavingsGoals()

  const remainingDays = getRemainingDays()
  const dayProgress = getDayProgress()
  const budgetBulanan = Number(profile?.budget_bulanan || 0)
  const sisaBudget = budgetBulanan > 0 ? budgetBulanan - summary.totalPengeluaran : summary.saldo
  const batasHarian = Math.max(Math.floor(sisaBudget / remainingDays), 0)
  const budgetUsedPercent = budgetBulanan > 0
    ? Math.min(Math.round((summary.totalPengeluaran / budgetBulanan) * 100), 100)
    : 0

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
        {/* Safe-to-Spend Widget */}
        <Card className="border-primary/20 bg-gradient-to-br from-emerald-50/50 to-background flex flex-col justify-between">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Batas Aman Harian</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">
              {formatRupiah(batasHarian)}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
              <Calendar className="h-3.5 w-3.5" />
              <span>Sisa {remainingDays} hari lagi bulan ini</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Waktu bulan berjalan</span>
                <span className="font-medium">{dayProgress}%</span>
              </div>
              <Progress value={dayProgress} />
            </div>
            {budgetBulanan > 0 && (
              <div className="space-y-1.5 mt-3 pt-3 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Budget bulanan</span>
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
