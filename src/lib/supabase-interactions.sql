-- Table C: Interactions
-- Links Users (A) and Pets (B) with dates/status
-- Used for reservations, appointments, contracts, etc.

-- Create interactions table
CREATE TABLE IF NOT EXISTS interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  veterinarian_id UUID REFERENCES utilisateurs(id),
  type TEXT NOT NULL CHECK (type IN ('Appointment', 'Reservation', 'Contract', 'Vaccination', 'Emergency', 'Follow-up', 'Other')),
  service TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  reason TEXT,
  notes TEXT,
  price DECIMAL(10,2),
  clinic_name TEXT,
  clinic_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interactions
CREATE POLICY "Users can view their own interactions" ON interactions
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own interactions" ON interactions
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own interactions" ON interactions
  FOR DELETE USING (auth.uid() = owner_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_interactions_owner_id ON interactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_interactions_pet_id ON interactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_interactions_scheduled_date ON interactions(scheduled_date);