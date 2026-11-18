import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowUpDown,
  Target,
  Handshake,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { to: '/transaksi', label: 'Transaksi', icon: ArrowUpDown },
  { to: '/tabungan', label: 'Tabungan', icon: Target },
  { to: '/hutang', label: 'Hutang', icon: Handshake },
  { to: '/pengaturan', label: 'Lainnya', icon: Settings },
]

export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border/80 bg-card/95 backdrop-blur-md shadow-lg"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="grid grid-cols-5 w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-1 text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-primary scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5 mb-0.5" />
            <span className="truncate max-w-[60px] text-center leading-tight">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
