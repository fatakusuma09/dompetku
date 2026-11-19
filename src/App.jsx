import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import TransactionsPage from '@/pages/TransactionsPage'
import SavingsPage from '@/pages/SavingsPage'
import DebtsPage from '@/pages/DebtsPage'
import SettingsPage from '@/pages/SettingsPage'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('DompetKu Runtime Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center bg-background">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Terjadi Kendala Tampilan</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
            {this.state.error?.message || 'Gagal memuat komponen.'}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
            >
              Muat Ulang Halaman
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.location.href = '/dashboard'
              }}
            >
              Ke Beranda
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Area with AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transaksi" element={<TransactionsPage />} />
              <Route path="/tabungan" element={<SavingsPage />} />
              <Route path="/hutang" element={<DebtsPage />} />
              <Route path="/pengaturan" element={<SettingsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
