-- Fix RLS for vet_accounts table
ALTER TABLE vet_accounts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own vet account upon registration
CREATE POLICY "Users can insert their own vet account" ON vet_accounts
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own vet account
CREATE POLICY "Users can view their own vet account" ON vet_accounts
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own vet account
CREATE POLICY "Users can update their own vet account" ON vet_accounts
  FOR UPDATE USING (auth.uid() = id);

-- If admins need access, add a policy for them as well
-- CREATE POLICY "Admins can manage vet_accounts" ON vet_accounts FOR ALL USING (
--   EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin')
-- );