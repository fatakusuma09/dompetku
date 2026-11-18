import { useState, useEffect } from 'react'
import { Download, Share, PlusSquare, X } from 'lucide-react'
import { Button } from './button'

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already running in standalone mode (already installed as PWA)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsStandalone(isStandaloneMode)

    // Check if running on iOS device
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isIosDevice)

    // Check if previously dismissed in this session
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed')
    if (isDismissed) setDismissed(true)

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa_banner_dismissed', 'true')
  }

  // If already installed or dismissed, do not render
  if (isStandalone || dismissed) return null

  // If Chrome has triggered install prompt
  if (deferredPrompt) {
    return (
      <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Download className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate text-foreground">
              Pasang Aplikasi DompetKu
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Akses cepat tanpa browser & hemat kuota
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            className="h-7 text-xs font-medium px-2.5"
            onClick={handleInstallClick}
          >
            Pasang
          </Button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-1"
            title="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  // If on iPhone iOS Safari (not yet standalone)
  if (isIOS) {
    return (
      <div className="mb-4 p-3 bg-secondary/80 border border-primary/20 rounded-xl text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-secondary-foreground">
            <Share className="h-3.5 w-3.5 text-primary" />
            <span>Pasang di iPhone (PWA)</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground p-0.5"
            title="Tutup"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Tekan tombol <strong>Bagikan (Share <Share className="inline h-3 w-3" />)</strong> di Safari, lalu pilih{' '}
          <strong className="text-foreground inline-flex items-center gap-0.5">
            <PlusSquare className="inline h-3 w-3 text-primary" /> Tambah ke Layar Utama
          </strong>.
        </p>
      </div>
    )
  }

  return null
}
