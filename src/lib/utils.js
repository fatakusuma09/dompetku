import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, getDaysInMonth, getDate } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount) {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// Ubah "60000" jadi "60.000" saat mengetik
export function formatNumberWithDots(val) {
  if (val === undefined || val === null || val === '') return ''
  const cleanNumber = String(val).replace(/\D/g, '')
  if (!cleanNumber) return ''
  return new Intl.NumberFormat('id-ID').format(Number(cleanNumber))
}

// Ubah "60.000" kembali jadi angka murni 60000
export function parseFormattedNumber(val) {
  if (!val) return 0
  const clean = String(val).replace(/\D/g, '')
  return Number(clean) || 0
}

export function formatTanggal(date) {
  if (!date) return ''
  return format(new Date(date), 'd MMM yyyy', { locale: id })
}

export function getRemainingDays() {
  const now = new Date()
  const totalDays = getDaysInMonth(now)
  const currentDay = getDate(now)
  return Math.max(totalDays - currentDay, 1)
}

export function getStartOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

export function getEndOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
}

export function getDayProgress() {
  const now = new Date()
  const totalDays = getDaysInMonth(now)
  const currentDay = getDate(now)
  return Math.round((currentDay / totalDays) * 100)
}

export const KATEGORI_PEMASUKAN = [
  'Uang Saku',
  'Freelance',
  'Beasiswa',
  'Lainnya',
]

export const KANTONG_CONFIG = [
  {
    id: 'makan',
    nama: 'Makan & Jajan',
    deskripsi: 'Jatah makan harian, warteg, ngopi, kuliner',
    kategori: ['Makanan', 'Nongkrong'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    isDaily: true,
  },
  {
    id: 'rutin',
    nama: 'Kebutuhan Rutin',
    deskripsi: 'Bensin, laundry, kos, print tugas, pulsa',
    kategori: ['Bensin / Transport', 'Transport', 'Laundry', 'Kos/Sewa', 'Print/Tugas', 'Pulsa/Internet'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    isDaily: false,
  },
  {
    id: 'urgensi',
    nama: 'Dana Urgensi',
    deskripsi: 'Servis motor, tambal ban, obat, keadaan mendesak',
    kategori: ['Servis Motor', 'Dana Urgensi / Darurat'],
    color: 'text-rose-600',
    bgColor: 'bg-rose-500',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    isDaily: false,
  },
  {
    id: 'lainnya',
    nama: 'Belanja & Lainnya',
    deskripsi: 'Belanja pribadi, hiburan, & pengeluaran variatif',
    kategori: ['Belanja', 'Lainnya'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    isDaily: false,
  },
]

export const KATEGORI_PENGELUARAN = [
  'Makanan',
  'Bensin / Transport',
  'Laundry',
  'Servis Motor',
  'Nongkrong',
  'Kos/Sewa',
  'Print/Tugas',
  'Pulsa/Internet',
  'Dana Urgensi / Darurat',
  'Belanja',
  'Lainnya',
]

export function getKantongForKategori(kategoriName) {
  const name = (kategoriName || '').toLowerCase()
  for (const kantong of KANTONG_CONFIG) {
    if (
      kantong.kategori.some(
        (k) =>
          k.toLowerCase() === name ||
          name.includes(k.toLowerCase()) ||
          k.toLowerCase().includes(name)
      )
    ) {
      return kantong
    }
  }
  return KANTONG_CONFIG[3]
}
