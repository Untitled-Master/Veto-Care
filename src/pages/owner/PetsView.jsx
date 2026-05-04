import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Loader2, PawPrint, 
  Calendar, FileText, BadgeInfo, 
  AlertCircle, History,
  ShieldCheck, Trash2, Save, Dog, Cat, Bird, Rabbit
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';
import { toast } from 'sonner';

const petIcons = {
  Dog: Dog,
  Cat: Cat,
  Bird: Bird,
  Rabbit: Rabbit,
  Other: PawPrint,
};

const statusOptions = ['Healthy', 'Checkup Needed', 'Sick', 'Under Treatment'];

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
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchPet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPet = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data, error: fetchError } = await supabase
        .from(TABLES.PETS)
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setPet(data);
      setEditForm(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pet details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const toastId = toast.loading('Updating medical record...');
    try {
      setSaving(true);
      const { error } = await supabase
        .from(TABLES.PETS)
        .update({
          name: editForm.name,
          breed: editForm.breed,
          weight_kg: editForm.weight_kg,
          status: editForm.status,
          color: editForm.color,
          microchip_number: editForm.microchip_number,
          notes: editForm.notes,
          updated_at: new Date()
        })
        .eq('id', id);

      if (error) throw error;
      
      setPet(editForm);
      setIsEditing(false);
      toast.success('Record updated successfully', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Update failed', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const toastId = toast.loading('Removing record from database...');
    try {
      const { error } = await supabase
        .from(TABLES.PETS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Pet record deleted', { id: toastId });
      navigate('/owner/pets');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <OwnerLayout title="Pet Details">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm text-zinc-500 font-medium">Accessing clinical data...</p>
      </div>
    </OwnerLayout>
  );

  const SpeciesIcon = petIcons[pet.species] || petIcons.Other;
  const age = calculateAge(pet.birth_date, pet.age_months);

  return (
    <OwnerLayout title={isEditing ? `Editing ${pet.name}` : pet.name}>
      <div className="max-w-[1000px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100 text-zinc-900">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => isEditing ? setIsEditing(false) : navigate('/owner/pets')}
            className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <div className="size-7 rounded-md border border-zinc-200 flex items-center justify-center bg-white shadow-sm">
              <ArrowLeft size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">{isEditing ? 'Cancel Editing' : 'Back to list'}</span>
          </button>

          {!isEditing && (
            <div className="flex items-center gap-2">
               <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-xs font-bold text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-all shadow-sm active:scale-95 uppercase tracking-tight"
               >
                <Edit size={14} className="text-emerald-600" /> Edit Record
               </button>
            </div>
          )}
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 sm:p-10 border-b border-zinc-100">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative shrink-0">
                <div className="size-32 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden shadow-inner ring-4 ring-white transition-all">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                        <SpeciesIcon size={48} className="text-zinc-900" />
                        <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-tighter">{pet.species}</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md border border-zinc-100">
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                    (isEditing ? editForm.status : pet.status) === 'Healthy' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {isEditing ? editForm.status : pet.status}
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4 max-w-sm">
                    <input 
                      className="text-3xl font-semibold tracking-tight text-black bg-zinc-50 border-b border-emerald-500 outline-none w-full px-2"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                    <input 
                      className="text-lg text-black font-medium bg-zinc-50 border-b border-zinc-200 outline-none w-full px-2"
                      value={editForm.breed}
                      onChange={(e) => setEditForm({...editForm, breed: e.target.value})}
                      placeholder="Breed"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{pet.name}</h1>
                    <p className="text-lg text-zinc-500 font-medium mt-2">{pet.breed || pet.species} • Registered Patient</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-6">
                       <History size={14} className="text-zinc-300" /> Updated {formatDate(pet.updated_at || pet.created_at)}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-100 bg-zinc-50/30">
            <div className="p-5 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</span>
              {isEditing ? (
                <select 
                  className="text-xs font-bold text-black bg-transparent outline-none cursor-pointer"
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <span className="text-sm font-semibold text-zinc-900">{pet.status}</span>
              )}
            </div>
            <div className="p-5 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Age</span>
              <span className="text-sm font-semibold text-zinc-900">{age}</span>
            </div>
            <div className="p-5 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Weight (kg)</span>
              {isEditing ? (
                <input 
                  type="number" step="0.1"
                  className="w-16 text-center text-sm font-semibold text-black bg-white border border-zinc-200 rounded"
                  value={editForm.weight_kg}
                  onChange={(e) => setEditForm({...editForm, weight_kg: e.target.value})}
                />
              ) : (
                <span className="text-sm font-semibold text-zinc-900">{pet.weight_kg || '---'}</span>
              )}
            </div>
            <div className="p-5 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Species</span>
              <span className="text-sm font-semibold text-zinc-900">{pet.species}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
              <BadgeInfo size={16} className="text-emerald-600" />
              <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Identification</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Color/Markings</span>
                {isEditing ? (
                  <input 
                    className="w-full text-sm font-semibold text-black bg-zinc-50 p-2 rounded border border-zinc-200"
                    value={editForm.color}
                    onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-semibold text-zinc-900">{pet.color || 'Not recorded'}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Microchip ID</span>
                {isEditing ? (
                  <input 
                    className="w-full text-sm font-mono font-bold text-black bg-zinc-50 p-2 rounded border border-zinc-200"
                    value={editForm.microchip_number}
                    onChange={(e) => setEditForm({...editForm, microchip_number: e.target.value})}
                  />
                ) : (
                  <p className="text-sm font-mono font-bold text-zinc-900 bg-zinc-50 px-2 py-1 rounded inline-block">{pet.microchip_number || 'UNASSIGNED'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
              <FileText size={16} className="text-emerald-600" />
              <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Clinical Notes</h3>
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea 
                  rows={4}
                  className="w-full text-sm text-black bg-zinc-50 p-3 rounded-lg border border-zinc-200 resize-none"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              ) : (
                <p className="text-sm text-zinc-600 italic leading-relaxed">&quot;{pet.notes || 'No specific notes recorded.'}&quot;</p>
              )}
            </div>
          </div>
        </div>

        {/* Save Bar (Only visible when editing) */}
        {isEditing && (
          <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 text-emerald-700">
               <ShieldCheck size={20} />
               <span className="text-sm font-semibold">You have unsaved changes</span>
            </div>
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 flex items-center gap-2 shadow-md shadow-emerald-200"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Medical Record
            </button>
          </div>
        )}

        {/* Danger Zone (Only visible when NOT editing) */}
        {!isEditing && (
           <div className="mt-12 pt-8 border-t border-zinc-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-red-50/30 rounded-xl border border-red-100 transition-all hover:bg-red-50/50">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2 italic">
                    <AlertCircle size={14} /> Remove Patient Record
                  </h3>
                  <p className="text-xs text-red-600 font-medium">This will permanently delete all clinical history for {pet.name}. This action is irreversible.</p>
                </div>
                {isDeleting ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setIsDeleting(false)} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-colors">Cancel</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200">Confirm Deletion</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsDeleting(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:border-red-300 transition-all shrink-0"
                  >
                    <Trash2 size={14} /> Archive Forever
                  </button>
                )}
              </div>
           </div>
        )}

        {/* Global Nav Footer */}
        {!isEditing && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/owner/appointments" className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-all active:scale-[0.98]">
              <Calendar size={18} /> Schedule Visit
            </Link>
            <Link to={`/owner/pets/${id}/records`} className="flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-all active:scale-[0.98]">
              <FileText size={18} /> Full Medical History
            </Link>
          </div>
        )}

      </div>
    </OwnerLayout>
  );
}