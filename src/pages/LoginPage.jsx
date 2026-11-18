import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Wallet, Mail, Lock, User, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { user, signIn, signUp, signInWithGoogle, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    namaLengkap: '',
  })

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isRegister) {
        const result = await signUp(form.email, form.password, form.namaLengkap)
        
        // If email confirmation is disabled or session exists, auto redirect will happen via useEffect
        // If session is null (confirmation required by Supabase), give clear feedback
        if (result?.user && !result?.session) {
          setSuccess('Pendaftaran berhasil! Silakan cek kotak masuk/spam email kamu untuk konfirmasi, lalu coba Masuk.')
          setIsRegister(false)
        } else {
          setSuccess('Akun berhasil dibuat! Mengalihkan...')
        }
      } else {
        await signIn(form.email, form.password)
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'Terjadi kendala saat menghubungkan ke database.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Gagal masuk dengan Google')
      setLoading(false)
    }
  }

  const handleGuest = () => {
    loginAsGuest()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto shadow-xs">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">DompetKu</h1>
          <p className="text-muted-foreground text-sm">
            Kelola keuangan kampusmu dengan mudah
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-sm border-border/80">
          <CardHeader className="pb-4">
            <CardTitle>{isRegister ? 'Buat Akun' : 'Masuk'}</CardTitle>
            <CardDescription>
              {isRegister
                ? 'Daftar untuk mulai mengelola keuanganmu'
                : 'Masuk ke akunmu untuk melanjutkan'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Guest Access Button */}
            <div className="mb-4 p-3 bg-secondary rounded-lg border border-primary/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Uji Coba Cepat (Tanpa Setup DB)</span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-card hover:bg-primary hover:text-primary-foreground border-primary/40 font-semibold transition-all text-xs"
                onClick={handleGuest}
              >
                Masuk sebagai Tamu (Mode Demo)
              </Button>
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">atau akun supabase</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <div className="space-y-1.5">
                  <Label htmlFor="namaLengkap" className="text-xs">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="namaLengkap"
                      name="namaLengkap"
                      placeholder="Nama lengkapmu"
                      value={form.namaLengkap}
                      onChange={handleChange}
                      className="pl-9 h-10"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@kampus.ac.id"
                    value={form.email}
                    onChange={handleChange}
                    className="pl-9 h-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={form.password}
                    onChange={handleChange}
                    className="pl-9 h-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isRegister ? 'Daftar' : 'Masuk'}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">opsi lain</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={handleGoogle}
              disabled={loading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </Button>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setSuccess('')
              }}
            >
              {isRegister
                ? 'Sudah punya akun? Masuk'
                : 'Belum punya akun? Daftar'}
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
