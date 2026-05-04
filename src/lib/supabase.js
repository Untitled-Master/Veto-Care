import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table name
export const TABLES = {
  UTILISATEURS: 'utilisateurs',
  PETS: 'pets',
  INTERACTIONS: 'interactions',
  VETS: 'vets',
  MEDICAL_RECORDS: 'medical_records',
  CLINIQUES: 'cliniques',
};

// User roles
export const USER_ROLES = {
  CLIENT: 'client',
  VET: 'vet',
  ADMIN: 'admin',
};