-- Complete setup for vet_accounts table
-- Run this in Supabase SQL Editor

-- 1. Create vet_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS vet_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  specialization TEXT,
  clinic_name TEXT,
  wilaya TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE vet_accounts ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own vet account" ON vet_accounts;
DROP POLICY IF EXISTS "Users can view their own vet account" ON vet_accounts;
DROP POLICY IF EXISTS "Users can update their own vet account" ON vet_accounts;
DROP POLICY IF EXISTS "Admins can manage vet_accounts" ON vet_accounts;

-- 4. Create policies
-- Allow users to insert their own vet account (for registration)
CREATE POLICY "Users can insert their own vet account" ON vet_accounts
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own vet account
CREATE POLICY "Users can view their own vet account" ON vet_accounts
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own vet account
CREATE POLICY "Users can update their own vet account" ON vet_accounts
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to manage all vet accounts
CREATE POLICY "Admins can manage vet_accounts" ON vet_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM utilisateurs 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vet_accounts_status ON vet_accounts(status);
CREATE INDEX IF NOT EXISTS idx_vet_accounts_wilaya ON vet_accounts(wilaya);

-- 6. (Optional) If you want to allow public read for some reason, you can add:
-- CREATE POLICY "Public can view active vets" ON vet_accounts FOR SELECT USING (status = 'active');

-- Note: Make sure the table is empty or has correct data.
-- If you need to grant permissions to the authenticated role, that's usually done by Supabase automatically.
