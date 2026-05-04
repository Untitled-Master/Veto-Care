-- Table D: Veterinarians (Vets)
-- Public profile for veterinarians

-- Create vets table
CREATE TABLE IF NOT EXISTS vets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  wilaya TEXT,
  commune TEXT,
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  profile_pic_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  specialties JSONB,
  services JSONB,
  working_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vets
CREATE POLICY "Anyone can view vets" ON vets
  FOR SELECT USING (true);

CREATE POLICY "Vets can update own profile" ON vets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage vets" ON vets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vets_wilaya ON vets(wilaya);
CREATE INDEX IF NOT EXISTS idx_vets_rating ON vets(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vets_is_available ON vets(is_available);

-- Add vets to TABLES in supabase.js
-- VETS: 'vets'