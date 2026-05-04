-- Table B: Ressources (Pets)
-- Run this in your Supabase SQL Editor

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('Dog', 'Cat', 'Bird', 'Rabbit', 'Other')),
  breed TEXT,
  age_months INTEGER,
  weight_kg DECIMAL(5,2),
  color TEXT,
  microchip_number TEXT,
  birth_date DATE,
  status TEXT DEFAULT 'Healthy' CHECK (status IN ('Healthy', 'Checkup Needed', 'Sick', 'Under Treatment')),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets
CREATE POLICY "Users can view their own pets" ON pets
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = owner_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);

-- Create medical_records table (linked to pets)
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  veterinarian_id UUID REFERENCES utilisateurs(id),
  appointment_id UUID REFERENCES appointments(id),
  record_type TEXT NOT NULL CHECK (record_type IN ('Checkup', 'Vaccination', 'Surgery', 'Treatment', 'Lab Result', 'Prescription', 'Other')),
  title TEXT NOT NULL,
  description TEXT,
  diagnosis TEXT,
  treatment TEXT,
  medications JSONB,
  vaccines JSONB,
  weight_at_visit DECIMAL(5,2),
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can view their pet records" ON medical_records
  FOR SELECT USING (
    pet_id IN (SELECT id FROM pets WHERE owner_id = auth.uid())
  );

CREATE POLICY " vets can view all records" ON medical_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'vet')
  );

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  veterinarian_id UUID REFERENCES utilisateurs(id),
  clinic_id UUID,
  service TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show')),
  notes TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = veterinarian_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = veterinarian_id);

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = owner_id);

-- Update TABLES constant in supabase.js
-- Add to src/lib/supabase.js:
-- PETS: 'pets',
-- MEDICAL_RECORDS: 'medical_records',
-- APPOINTMENTS: 'appointments',