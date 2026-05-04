import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, PawPrint, Info, Activity, 
  Weight, Calendar, Hash, Palette, FileText, 
  Dog, Cat, Bird, Rabbit, Ghost, Plus, ChevronRight,
  ShieldCheck, Check
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';

const speciesOptions = [
  { label: 'Dog', icon: Dog },
  { label: 'Cat', icon: Cat },
  { label: 'Bird', icon: Bird },
  { label: 'Rabbit', icon: Rabbit },
  { label: 'Other', icon: Ghost },
];

const statusOptions = [
  { label: 'Healthy', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'Checkup Needed', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { label: 'Sick', color: 'bg-red-50 text-red-700 border-red-100' },
  { label: 'Under Treatment', color: 'bg-blue-50 text-blue-700 border-blue-100' },
];

export default function PetsAdd() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age_months: '',
    weight_kg: '',
    color: '',
    microchip_number: '',
    birth_date: '',
    status: 'Healthy',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = "pet-upload";
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const petData = {
        owner_id: user.id,
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || null,
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        color: formData.color.trim() || null,
        microchip_number: formData.microchip_number.trim() || null,
        birth_date: formData.birth_date || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
      };

      const { data, error: insertError } = await supabase
        .from(TABLES.PETS)
        .insert(petData)
        .select()
        .single();

      if (insertError) throw insertError;
      navigate(`/owner/pets/${data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to add pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout title="Register Companion">
      <div className="max-w-[800px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
            <button 
                onClick={() => navigate('/owner/pets')}
                className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
                <div className="size-7 rounded-md border border-zinc-200 flex items-center justify-center bg-white group-hover:border-zinc-300 shadow-sm transition-all">
                    <ArrowLeft size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Back to list</span>
            </button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden transition-all">
          <div className="px-8 py-6 border-b border-zinc-100 bg-zinc-50/30">
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Pet Registration</h2>
            <p className="text-zinc-500 text-sm mt-1">Add a new companion to your medical dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                <Info size={16} /> {error}
              </div>
            )}

            {/* Species Selection - Clean SaaS Grid */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <PawPrint size={14} className="text-emerald-600" /> Species Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {speciesOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, species: opt.label }))}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 ${
                      formData.species === opt.label 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-600' 
                        : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <opt.icon size={20} className={formData.species === opt.label ? 'text-emerald-600' : 'text-zinc-400'} />
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              
              {/* Card Section: Identity */}
              <div className="space-y-6 md:col-span-2">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                   <Info size={14} className="text-zinc-400" />
                   <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">General Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-700 ml-1">Pet Name *</label>
                    <input
                        type="text" name="name" required value={formData.name} onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                        placeholder="e.g. Luna"
                    />
                    </div>
                    <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-700 ml-1">Breed</label>
                    <input
                        type="text" name="breed" value={formData.breed} onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                        placeholder="e.g. Siberian Husky"
                    />
                    </div>
                </div>
              </div>

              {/* Card Section: Vitals */}
              <div className="space-y-6 md:col-span-2">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                   <Activity size={14} className="text-zinc-400" />
                   <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Medical Vitals</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 ml-1 flex items-center gap-1">
                            <Weight size={14} className="text-zinc-400" /> Weight (kg)
                        </label>
                        <input
                            type="number" step="0.1" name="weight_kg" value={formData.weight_kg} onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-emerald-500 outline-none transition-all"
                            placeholder="0.0"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 ml-1 flex items-center gap-1">
                            <Calendar size={14} className="text-zinc-400" /> Birth Date
                        </label>
                        <input
                            type="date" name="birth_date" value={formData.birth_date} onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 ml-1">Current Status</label>
                        <div className="relative">
                            <select
                                name="status" value={formData.status} onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                {statusOptions.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                            </select>
                            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
              </div>

              {/* Card Section: Identification */}
              <div className="space-y-6 md:col-span-2">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                   <Hash size={14} className="text-zinc-400" />
                   <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Identification & Notes</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 ml-1 flex items-center gap-1">
                            <Palette size={14} className="text-zinc-400" /> Primary Color
                        </label>
                        <input
                            type="text" name="color" value={formData.color} onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                            placeholder="e.g. Golden / White"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 ml-1 flex items-center gap-1">
                            <ShieldCheck size={14} className="text-zinc-400" /> Microchip ID
                        </label>
                        <input
                            type="text" name="microchip_number" value={formData.microchip_number} onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                            placeholder="15-digit number"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-semibold text-zinc-700 ml-1">Clinical Notes</label>
                        <textarea
                            name="notes" rows={3} value={formData.notes} onChange={handleChange}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-zinc-700 placeholder:text-zinc-400"
                            placeholder="Allergies, chronic conditions, or temperament..."
                        />
                    </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => navigate('/owner/pets')}
                className="px-6 py-2 border border-zinc-200 text-zinc-600 font-semibold rounded-lg text-sm hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-2 bg-zinc-900 text-white font-semibold rounded-lg text-sm hover:bg-zinc-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Complete Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </OwnerLayout>
  );
}