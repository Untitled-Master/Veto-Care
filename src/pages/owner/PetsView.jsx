import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Loader2, Heart, Activity, PawPrint, 
  Calendar, FileText, Scale, BadgeInfo, Hash, Palette, 
  Clock, CheckCircle2, AlertCircle, ChevronRight, History,
  ShieldCheck, ExternalLink, Dog, Cat, Bird, Rabbit, Ghost, Save
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';

// Species to Icon Mapping
const petIcons = {
  Dog: Dog,
  Cat: Cat,
  Bird: Bird,
  Rabbit: Rabbit,
  Other: PawPrint,
};

function calculateAge(birthDate, ageMonths) {
  if (birthDate) {
    const date = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} years`;
  }
  return ageMonths ? `${ageMonths} months` : 'N/A';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PetsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Please log in');

      const { data, error: fetchError } = await supabase
        .from(TABLES.PETS)
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setPet(data);
    } catch (err) {
      setError('Failed to load pet details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <OwnerLayout title="Pet Details">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-sm text-zinc-500 font-medium animate-pulse">Syncing clinical data...</p>
        </div>
      </OwnerLayout>
    );
  }

  if (error || !pet) {
    return (
      <OwnerLayout title="Error">
        <div className="max-w-md mx-auto py-20 text-center px-6">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900">{error || 'Pet record not found'}</h3>
          <button onClick={() => navigate('/owner/pets')} className="mt-4 text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Return to dashboard
          </button>
        </div>
      </OwnerLayout>
    );
  }

  // Determine which icon to show based on the pet species
  const SpeciesIcon = petIcons[pet.species] || petIcons.Other;
  const age = calculateAge(pet.birth_date, pet.age_months);

  const action = (
    <Link
      to={`/owner/pets/${id}/edit`}
      className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-xs font-bold text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-all shadow-sm active:scale-95 uppercase tracking-tight"
    >
      <Edit size={14} className="text-emerald-600" /> Edit Profile
    </Link>
  );

  return (
    <OwnerLayout title={pet.name} action={action}>
      <div className="max-w-[1000px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100 text-zinc-900">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-10">
          <button 
            onClick={() => navigate('/owner/pets')}
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <div className="size-7 rounded-md border border-zinc-200 flex items-center justify-center bg-white group-hover:border-zinc-300 shadow-sm transition-all">
              <ArrowLeft size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Medical Record</span>
          </button>
        </div>

        {/* Profile Hero Section */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-10 border-b border-zinc-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              
              {/* Profile Avatar / Species Icon */}
              <div className="relative shrink-0">
                <div className="size-32 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden shadow-inner ring-4 ring-white transition-all">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                        <SpeciesIcon size={48} className="text-black" />
                        <span className="text-[10px] font-bold uppercase text-zinc-300 tracking-tighter">{pet.species}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md border border-zinc-100">
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                    pet.status === 'Healthy' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {pet.status}
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{pet.name}</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-200 text-zinc-400 uppercase tracking-widest">
                    Record No. {pet.id.slice(0, 8)}
                  </span>
                </div>
                <p className="text-lg text-zinc-500 font-medium mt-2">{pet.breed || pet.species} • Registered Patient</p>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-zinc-400 mt-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
                    <History size={14} className="text-zinc-300" /> Member since {formatDate(pet.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vercel-Style Divided Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/30">
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Species</span>
              <div className="flex items-center gap-2">
                <SpeciesIcon size={14} className="text-emerald-600" />
                <span className="text-sm font-semibold text-zinc-900">{pet.species}</span>
              </div>
            </div>
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Age</span>
              <span className="text-sm font-semibold text-zinc-900">{age}</span>
            </div>
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Weight</span>
              <span className="text-sm font-semibold text-zinc-900">{pet.weight_kg ? `${pet.weight_kg} kg` : '---'}</span>
            </div>
            <div className="p-5 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Birthday</span>
              <span className="text-sm font-semibold text-zinc-900">{pet.birth_date ? formatDate(pet.birth_date) : '---'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section: Identification */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col transition-all hover:border-zinc-300">
            <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
              <BadgeInfo size={16} className="text-emerald-600" />
              <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Identification Details</h3>
            </div>
            <div className="p-6 space-y-5 flex-1">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Palette size={14} className="text-zinc-300" />
                  <span className="text-xs font-medium">Color/Markings</span>
                </div>
                <span className="text-xs font-semibold text-zinc-900">{pet.color || 'Not recorded'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Hash size={14} className="text-zinc-300" />
                  <span className="text-xs font-medium">Microchip ID</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  {pet.microchip_number || 'UNASSIGNED'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-zinc-50 mt-4 pt-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium">Verification Status</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified Patient</span>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col transition-all hover:border-zinc-300">
            <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
              <FileText size={16} className="text-emerald-600" />
              <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Medical & Behavioral Notes</h3>
            </div>
            <div className="p-6 flex-1">
              {pet.notes ? (
                <p className="text-sm text-zinc-600 leading-relaxed italic">
                  "{pet.notes}"
                </p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-4">
                   <p className="text-xs text-zinc-400 font-medium">No clinical notes recorded yet.</p>
                   <Link to={`/owner/pets/${id}/edit`} className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">Add clinical details</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/owner/appointments" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all active:scale-[0.98]"
          >
            <Calendar size={18} /> Schedule Clinical Visit
          </Link>
          <Link 
            to={`/owner/pets/${id}/records`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <Activity size={18} /> View Health History
          </Link>
        </div>

      </div>
    </OwnerLayout>
  );
}