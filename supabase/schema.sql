-- ============================================
-- DompetKu - Supabase SQL Schema (Full & Idempotent)
-- ============================================
-- Jalankan seluruh isi file ini di Supabase SQL Editor:
-- Dashboard > SQL Editor > New Query > Paste > Run
-- ============================================

-- 1. Tabel Profiles (ekstensi dari auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nama_lengkap TEXT,
  avatar_url TEXT,
  budget_bulanan NUMERIC(12, 2) DEFAULT 0,
  batas_harian NUMERIC(12, 2) DEFAULT 0,
  pos_budget JSONB DEFAULT '{"makan": 0, "rutin": 0, "urgensi": 0, "lainnya": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom batas_harian & pos_budget ada jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batas_harian NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pos_budget JSONB DEFAULT '{"makan": 0, "rutin": 0, "urgensi": 0, "lainnya": 0}'::jsonb;

-- 2. Tabel Transactions (pemasukan & pengeluaran)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipe TEXT NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  jumlah NUMERIC(12, 2) NOT NULL CHECK (jumlah > 0),
  kategori TEXT NOT NULL,
  catatan TEXT DEFAULT '',
  tanggal DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Debts (hutang piutang)
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipe TEXT NOT NULL CHECK (tipe IN ('hutang', 'piutang')),
  nama_orang TEXT NOT NULL,
  jumlah NUMERIC(12, 2) NOT NULL CHECK (jumlah > 0),
  catatan TEXT DEFAULT '',
  lunas BOOLEAN DEFAULT FALSE,
  tanggal DATE DEFAULT CURRENT_DATE,
  tanggal_lunas DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Savings Goals (Target Menabung)
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nama_target TEXT NOT NULL,
  target_jumlah NUMERIC(12, 2) NOT NULL CHECK (target_jumlah > 0),
  terkumpul NUMERIC(12, 2) DEFAULT 0 CHECK (terkumpul >= 0),
  deadline DATE,
  warna TEXT DEFAULT '#059669',
  selesai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERMISSIONS (GRANT)
-- Memberikan hak akses penuh ke role authenticated & anon
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ============================================
-- INDEXES untuk performa query
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tanggal ON public.transactions(user_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tipe ON public.transactions(user_id, tipe);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_lunas ON public.debts(user_id, lunas);
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings_goals(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Debts RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own debts" ON public.debts;
CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own debts" ON public.debts;
CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own debts" ON public.debts;
CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own debts" ON public.debts;
CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

-- Savings Goals RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own savings goals" ON public.savings_goals;
CREATE POLICY "Users can view own savings goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings goals" ON public.savings_goals;
CREATE POLICY "Users can insert own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own savings goals" ON public.savings_goals;
CREATE POLICY "Users can update own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own savings goals" ON public.savings_goals;
CREATE POLICY "Users can delete own savings goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION & TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
