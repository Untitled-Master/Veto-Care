import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Building2, Stethoscope, 
  Save, Loader2, Camera, Plus, X, Clock, Briefcase, CheckCircle2, Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const DEFAULT_HOURS = {
  monday: "08:00-17:00",
  tuesday: "08:00-17:00",
  wednesday: "08:00-17:00",
  thursday: "08:00-17:00",
  friday: "08:00-12:00",
  saturday: "Closed",
  sunday: "Closed"
};

export default function VetProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  
  const [newService, setNewService] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    wilaya: '',
    commune: '',
    specialties: ['General Practice'],
    services: ['General Checkup', 'Vaccination'],
    bio: '',
    experience_years: 0,
    clinic_name: '',
    is_available: true,
    profile_pic_url: '',
    working_hours: DEFAULT_HOURS,
    license_number: '',
    rating: 0,
    review_count: 0,
    created_at: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate('/vet/login'); return; }
      setUser(authUser);

      const [vetRes, accountRes] = await Promise.all([
        supabase.from('vets').select('*').eq('id', authUser.id).maybeSingle(),
        supabase.from('vet_accounts').select('license_number').eq('id', authUser.id).maybeSingle()
      ]);

      const { data, error } = vetRes;
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          ...data,
          email: data.email || authUser.email || '',
          phone: data.phone || '',
          specialties: data.specialties || ['General Practice'],
          services: data.services || [],
          working_hours: data.working_hours || DEFAULT_HOURS,
          license_number: accountRes.data?.license_number || '',
          rating: data.rating || 0,
          review_count: data.review_count || 0,
          created_at: data.created_at || ''
        });
      } else {
        setProfile(prev => ({ ...prev, email: authUser.email || '', license_number: accountRes.data?.license_number || '' }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Start loading toast
    const toastId = toast.loading('Uploading profile picture...');

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setProfile(prev => ({ ...prev, profile_pic_url: publicUrl }));
      
      // 2. Success toast (updates the loading one)
      toast.success('Photo uploaded successfully!', { id: toastId });
    } catch (error) {
      // 3. Error toast
      toast.error('Error uploading image: ' + error.message, { id: toastId });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const addSpecialty = () => {
    const val = newSpecialty.trim();
    if (!val) return;
    if (!profile.specialties.includes(val)) {
      setProfile({ ...profile, specialties: [...profile.specialties, val] });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setProfile({
      ...profile,
      specialties: profile.specialties.filter((_, i) => i !== index)
    });
  };

  const addService = () => {
    const val = newService.trim();
    if (!val) return;
    if (!profile.services.includes(val)) {
      setProfile({ ...profile, services: [...profile.services, val] });
      setNewService('');
    }
  };

  const removeService = (index) => {
    setProfile({
      ...profile,
      services: profile.services.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // 1. Start loading toast
    const toastId = toast.loading('Saving profile changes...');

    try {
      const { error } = await supabase
        .from('vets')
        .upsert({
          id: user.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          wilaya: profile.wilaya,
          commune: profile.commune,
          experience_years: parseInt(profile.experience_years) || 0,
          bio: profile.bio,
          profile_pic_url: profile.profile_pic_url,
          is_available: profile.is_available,
          specialties: profile.specialties,
          services: profile.services,
          working_hours: profile.working_hours,
          updated_at: new Date(),
        });

      if (error) throw error;
      
      // 2. Success toast
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (error) {
      // 3. Error toast
      toast.error('Failed to save changes: ' + error.message, { id: toastId });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-emerald-600 size-8" />
      <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading your profile...</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header Section - Clean & Minimal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Vet Profile</h1>
          <p className="text-zinc-500 text-sm">Manage your public presence and clinical information.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-emerald-200/50 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - User Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="size-32 rounded-2xl bg-zinc-50 overflow-hidden border border-zinc-100 ring-4 ring-white shadow-sm transition-all group-hover:ring-zinc-50">
                  {profile.profile_pic_url ? (
                    <img src={profile.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 bg-white p-2 rounded-lg border border-zinc-200 shadow-md text-zinc-600 hover:text-emerald-600 hover:scale-105 transition-all"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
              </div>
              
              <h3 className="mt-5 font-semibold text-xl text-zinc-900 leading-none">{profile.name || 'Set your name'}</h3>
              <p className="mt-2 text-zinc-500 text-sm font-medium px-4 py-1 bg-zinc-50 border border-zinc-100 rounded-full inline-block">
                {profile.specialties[0] || 'Veterinarian'}
              </p>
              
              <div className="mt-8 grid grid-cols-3 w-full gap-2 pt-6 border-t border-zinc-50">
                <div>
                  <p className="text-lg font-semibold text-zinc-900">{profile.experience_years}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Years</p>
                </div>
                <div className="border-x border-zinc-100">
                  <p className="text-lg font-semibold text-zinc-900">{profile.rating || '5.0'}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Rating</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-zinc-900">{profile.review_count || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Reviews</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50/50 p-4 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${profile.is_available ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                  <span className="text-xs font-semibold text-zinc-700 uppercase tracking-tight">Availability</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={profile.is_available} 
                    onChange={(e) => setProfile({...profile, is_available: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Side Meta Details */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">License Status</span>
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Member since</span>
              <span className="font-medium text-zinc-900">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Main Editor */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card 1: Details */}
          <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-2">
              <User className="size-4 text-zinc-400" />
              <h3 className="font-semibold text-zinc-900 text-sm">Basic Information</h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">Full Name</label>
                <input 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">Clinic Name</label>
                <input 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={profile.clinic_name}
                  onChange={(e) => setProfile({...profile, clinic_name: e.target.value})}
                  placeholder="Central Veterinary Clinic"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-emerald-600 uppercase tracking-tight">Public Email</label>
                <input 
                  type="email"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-emerald-600 uppercase tracking-tight">Public Phone</label>
                <input 
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">Wilaya</label>
                  <input 
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    value={profile.wilaya}
                    onChange={(e) => setProfile({...profile, wilaya: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-zinc-500 uppercase tracking-tight">Commune</label>
                  <input 
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    value={profile.commune}
                    onChange={(e) => setProfile({...profile, commune: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Expertise */}
          <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-2">
              <Stethoscope className="size-4 text-zinc-400" />
              <h3 className="font-semibold text-zinc-900 text-sm">Expertise & Experience</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[12px] font-medium text-zinc-500 uppercase">Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((spec, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-xs font-semibold">
                      {spec}
                      <button onClick={() => removeSpecialty(index)} className="hover:text-emerald-900"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input 
                    className="flex-1 px-3 py-1.5 rounded-md border border-zinc-200 text-sm focus:border-emerald-500 outline-none transition-all"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Add specialty..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  />
                  <button type="button" onClick={addSpecialty} className="p-1.5 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"><Plus size={16} /></button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-500 uppercase">Professional Bio</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-900 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Share your professional background and approach to animal care..."
                />
              </div>
            </div>
          </section>

          {/* Card 3: Working Hours */}
          <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-2">
              <Clock className="size-4 text-zinc-400" />
              <h3 className="font-semibold text-zinc-900 text-sm">Working Hours</h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.keys(profile.working_hours).map((day) => (
                <div key={day} className="flex flex-col p-3 rounded-lg border border-zinc-100 bg-zinc-50/30 group hover:border-emerald-200 transition-colors">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 mb-1">{day}</span>
                  <input 
                    className="bg-transparent text-sm font-medium text-zinc-900 outline-none focus:text-emerald-600 transition-colors"
                    value={profile.working_hours[day]}
                    onChange={(e) => {
                      const newHours = { ...profile.working_hours, [day]: e.target.value };
                      setProfile({...profile, working_hours: newHours});
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}