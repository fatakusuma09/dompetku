# DompetKu 🎓💳

Aplikasi web manajemen keuangan personal & mahasiswa: minimalis, cepat, mobile-first, 100% free stack.

## Tech Stack
- **Frontend:** React 19 + Vite + Tailwind CSS v4 + Radix UI + Lucide Icons
- **Backend & DB:** Supabase (PostgreSQL + RLS + Supabase Auth)
- **Deployment:** Vercel / Cloudflare Pages

## Fitur Utama
1. **Executive Dashboard:** Saldo bersih, pemasukan, pengeluaran bulanan.
2. **Safe-to-Spend Widget:** Hitung limit pengeluaran per hari otomatis: `(sisa budget) / (sisa hari bulan ini)`.
3. **Pencatatan Cepat (Quick Logger):** Kategori mahasiswa (Uang Saku, Freelance, Makanan, Kos, Print/Tugas, Nongkrong, dsb).
4. **Hutang Piutang (Debt Tracker):** Lacak "Saya Berhutang" & "Piutang Saya" + tombol Lunas.
5. **Autentikasi:** Email & Password + Google OAuth via Supabase.

---

## Setup & Menjalankan

### 1. Database Supabase
Buka **Supabase Dashboard** > **SQL Editor** > **New Query**, copy & run script dari:
`supabase/schema.sql`

### 2. Environment Variables
Buat file `.env` di root proyek:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Jalankan Dev Server
```powershell
npm run dev
```

### 4. Build Production
```powershell
npm run build
```
