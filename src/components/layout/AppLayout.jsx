import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import PWAInstallBanner from '@/components/ui/PWAInstallBanner'
import { Wallet } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AppLayout() {
  const { user, isGuest } = useAuth()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Header (Visible only on mobile) */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b bg-card/90 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              DompetKu
            </span>
          </div>
          {isGuest && (
            <span className="text-[10px] bg-secondary text-secondary-foreground font-semibold px-2 py-0.5 rounded-full border border-primary/20">
              Mode Tamu
            </span>
          )}
        </header>

        {/* Dynamic Page Container */}
        <div className="flex-1 w-full mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 pb-28 md:pb-12">
          <PWAInstallBanner />
          <Outlet />
        </div>
      </main>

      {/* Mobile Floating Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
