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

export const KANTONG_EMOJI_OPTIONS = [
  '🍔',
  '🛵',
  '🧺',
  '🚨',
  '☕',
  '🏠',
  '📚',
  '👕',
  '🎮',
  '💊',
  '🎬',
  '🛍️',
  '💡',
  '💰',
  '🏋️',
  '✈️',
]

export const DEFAULT_KANTONG = [
  {
    id: 'k_makan',
    nama: 'Makan & Minum',
    icon: '🍔',
    alokasi: 750000,
    isDaily: true,
  },
  {
    id: 'k_motor',
    nama: 'Bensin & Servis Motor',
    icon: '🛵',
    alokasi: 300000,
    isDaily: false,
  },
  {
    id: 'k_laundry',
    nama: 'Laundry & Kebersihan',
    icon: '🧺',
    alokasi: 150000,
    isDaily: false,
  },
  {
    id: 'k_urgensi',
    nama: 'Dana Urgensi & Darurat',
    icon: '🚨',
    alokasi: 200000,
    isDaily: false,
  },
  {
    id: 'k_hiburan',
    nama: 'Nongkrong & Hiburan',
    icon: '☕',
    alokasi: 100000,
    isDaily: false,
  },
]

export function getKantongListFromProfile(prof) {
  const pb = prof?.pos_budget
  if (Array.isArray(pb?.kantong_list)) {
    return pb.kantong_list
  }
  if (Array.isArray(pb)) {
    return pb
  }
  if (pb && typeof pb === 'object' && (pb.makan || pb.rutin || pb.urgensi || pb.lainnya)) {
    return [
      { id: 'k_makan', nama: 'Makan & Minum', icon: '🍔', alokasi: Number(pb.makan || 0), isDaily: true },
      { id: 'k_motor', nama: 'Bensin & Servis', icon: '🛵', alokasi: Number(pb.rutin || 0), isDaily: false },
      { id: 'k_urgensi', nama: 'Dana Urgensi / Darurat', icon: '🚨', alokasi: Number(pb.urgensi || 0), isDaily: false },
      { id: 'k_lainnya', nama: 'Belanja & Lainnya', icon: '🛍️', alokasi: Number(pb.lainnya || 0), isDaily: false },
    ]
  }
  return DEFAULT_KANTONG
}

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

export function getMatchingKantong(kategoriName, customKantongList) {
  const list =
    Array.isArray(customKantongList) && customKantongList.length > 0
      ? customKantongList
      : DEFAULT_KANTONG
  const name = (kategoriName || '').toLowerCase()

  // 1. Cek kecocokan kata kunci
  if (
    name.includes('makan') ||
    name.includes('kuliner') ||
    name.includes('nasi') ||
    name.includes('warteg')
  ) {
    const found = list.find((k) => k.isDaily || k.nama.toLowerCase().includes('makan'))
    if (found) return found
  }

  if (
    name.includes('bensin') ||
    name.includes('transport') ||
    name.includes('motor') ||
    name.includes('kendaraan')
  ) {
    const found = list.find(
      (k) =>
        k.nama.toLowerCase().includes('bensin') ||
        k.nama.toLowerCase().includes('motor') ||
        k.nama.toLowerCase().includes('transport') ||
        k.nama.toLowerCase().includes('rutin')
    )
    if (found) return found
  }

  if (name.includes('laundry')) {
    const found = list.find((k) => k.nama.toLowerCase().includes('laundry'))
    if (found) return found
  }

  if (
    name.includes('urgensi') ||
    name.includes('darurat') ||
    name.includes('servis') ||
    name.includes('obat') ||
    name.includes('sakit')
  ) {
    const found = list.find(
      (k) =>
        k.nama.toLowerCase().includes('urgensi') ||
        k.nama.toLowerCase().includes('darurat')
    )
    if (found) return found
  }

  if (
    name.includes('nongkrong') ||
    name.includes('kopi') ||
    name.includes('hiburan') ||
    name.includes('belanja')
  ) {
    const found = list.find(
      (k) =>
        k.nama.toLowerCase().includes('nongkrong') ||
        k.nama.toLowerCase().includes('hiburan') ||
        k.nama.toLowerCase().includes('belanja') ||
        k.nama.toLowerCase().includes('santai')
    )
    if (found) return found
  }

  // 2. Fallback: jika tidak cocok kata kunci, gunakan kantong pertama
  return list[0]
}
