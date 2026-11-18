import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, getDaysInMonth, getDate } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

export const KATEGORI_PENGELUARAN = [
  'Makanan',
  'Transport',
  'Kos/Sewa',
  'Print/Tugas',
  'Nongkrong',
  'Belanja',
  'Pulsa/Internet',
  'Lainnya',
]
