import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowUpDown,
  Handshake,
  Settings,
  LogOut,
  Wallet,
  Target,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { to: '/transaksi', label: 'Transaksi', icon: ArrowUpDown },
  { to: '/tabungan', label: 'Target Tabungan', icon: Target },
  { to: '/hutang', label: 'Hutang Piutang', icon: Handshake },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

export default function Sidebar() {
  const { user, profile, signOut, isGuest } = useAuth()

  const getInitial = () => {
    const name = profile?.nama_lengkap || user?.email || '?'
    return name.charAt(0).toUpperCase()
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card border-r sticky top-0 shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">DompetKu</h1>
          <p className="text-xs text-muted-foreground">Kelola keuanganmu</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
            {getInitial()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">
                {profile?.nama_lengkap || 'Pengguna'}
              </p>
              {isGuest && (
                <span className="text-[9px] bg-secondary text-secondary-foreground font-semibold px-1.5 py-0.2 rounded border border-primary/20 shrink-0">
                  Tamu
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Keluar
        </Button>
      </div>
    </aside>
  )
}
