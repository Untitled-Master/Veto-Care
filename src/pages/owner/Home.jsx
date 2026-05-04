import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Calendar, ChevronRight, Heart, Activity, PawPrint, Loader2, 
  Clipboard, ShieldCheck, Clock, ArrowUpRight, Sparkles
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';

const petIcons = {
  Dog: Activity,
  Cat: Heart,
  Bird: Activity,
  Rabbit: PawPrint,
  Other: PawPrint,
};

function calculateAge(birthDate, ageMonths) {
  if (birthDate) {
    const date = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years}y`;
  }
  if (ageMonths) {
    if (ageMonths < 12) return `${ageMonths}mo`;
    const years = Math.floor(ageMonths / 12);
    const remMonths = ageMonths % 12;
    return remMonths > 0 ? `${years}y ${remMonths}mo` : `${years}y`;
  }
  return '?';
}

export default function OwnerHome() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data: profileData } = await supabase.from('utilisateurs').select('*').eq('id', authUser.id).single();
        if (profileData) setProfile(profileData);
        
        await Promise.all([
          fetchPets(authUser.id),
          fetchAppointments(authUser.id)
        ]);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (userId) => {
    const { data } = await supabase
      .from(TABLES.PETS)
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setPets(data);
  };

  const fetchAppointments = async (userId) => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('owner_id', userId)
      .order('scheduled_date', { ascending: true })
      .limit(3);
    if (data) setAppointments(data);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  
  const healthScore = useMemo(() => {
    if (pets.length === 0) return 0;
    const healthy = pets.filter(p => p.status === 'Healthy').length;
    return Math.round((healthy / pets.length) * 100);
  }, [pets]);

  const activeApptsCount = appointments.filter(a => ['pending', 'confirmed'].includes(a.status?.toLowerCase())).length;

  const stats = [
    { label: 'My Pets', value: pets.length, icon: PawPrint, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Visits', value: appointments.length, icon: Clipboard, color: 'text-zinc-600', bg: 'bg-zinc-50' },
    { label: 'Upcoming', value: activeApptsCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Health Index', value: `${healthScore}%`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) {
    return (
      <OwnerLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Initializing your dashboard...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Dashboard">
      <div className="max-w-[1200px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-100">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 flex items-center gap-3">
              Welcome back, {displayName} <span className="animate-bounce">👋</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium">Monitoring the wellness of your companions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/owner/appointments" 
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <Calendar size={14} /> Book Visit
            </Link>
            <Link 
              to="/owner/pets/add" 
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-200/50 active:scale-95"
            >
              <Plus size={14} /> Add Pet
            </Link>
          </div>
        </div>

        {/* Stats Grid - High Density */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-zinc-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{stat.value}</span>
                <ArrowUpRight size={14} className="text-zinc-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Column: My Pets */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <PawPrint size={16} className="text-emerald-600" />
                </div>
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight uppercase">Your Pets</h2>
              </div>
              <Link to="/owner/pets" className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700">
                View all pets
              </Link>
            </div>

            {pets.length > 0 ? (
              <div className="grid gap-3">
                {pets.map((pet) => {
                  const PetIcon = petIcons[pet.species] || Activity;
                  const age = calculateAge(pet.birth_date, pet.age_months);
                  return (
                    <Link 
                      key={pet.id} 
                      to={`/owner/pets/${pet.id}`} 
                      className="group flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-200 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-14 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                          {pet.image_url ? (
                            <img src={pet.image_url} alt={pet.name} className="size-full object-cover" />
                          ) : (
                            <div className="size-full flex items-center justify-center text-zinc-300">
                               <PetIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors leading-none">{pet.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">
                              {pet.breed || pet.species}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">Age: {age}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          pet.status === 'Healthy' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {pet.status}
                        </div>
                        <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-200 border-dashed p-16 text-center shadow-sm">
                <div className="size-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                  <Sparkles className="text-zinc-300" size={24} />
                </div>
                <h3 className="text-zinc-900 font-semibold text-sm">No pets registered yet</h3>
                <p className="text-zinc-500 text-xs mt-1 mb-6 max-w-[240px] mx-auto">Start by registering your pet to track their clinical records.</p>
                <Link to="/owner/pets/add" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-all">
                  <Plus size={14} /> Add your first pet
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar Column: Schedule */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight uppercase">Recent Visits</h2>
              </div>
              <Link to="/owner/appointments" className="text-[11px] font-bold text-zinc-400 uppercase hover:text-zinc-900">See all</Link>
            </div>

            {appointments.length > 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm divide-y divide-zinc-100">
                {appointments.map((appt) => (
                  <Link 
                    key={appt.id} 
                    to={`/owner/appointments/${appt.id}`} 
                    className="flex flex-col gap-2.5 p-5 hover:bg-zinc-50/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                        {appt.service_type || 'Visit'}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                        <Clock size={12} className="text-zinc-300" /> {appt.scheduled_time}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">{appt.service_type || 'Clinical Checkup'}</h4>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-50">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        {new Date(appt.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-50/50 rounded-xl border border-zinc-200 border-dashed">
                <div className="size-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-100">
                    <Calendar size={18} className="text-zinc-300" />
                </div>
                <p className="text-zinc-900 font-semibold text-xs leading-none">No upcoming visits</p>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-tight">Stay tuned for updates</p>
              </div>
            )}
            
            {/* Quick Support Badge */}
            <div className="p-4 rounded-xl bg-zinc-900 text-white shadow-lg shadow-zinc-200">
               <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verified Care</span>
               </div>
               <p className="text-xs text-zinc-400 leading-relaxed font-medium">All our clinics are vetted and license-checked for pet safety.</p>
            </div>
          </div>

        </div>
      </div>
    </OwnerLayout>
  );
}