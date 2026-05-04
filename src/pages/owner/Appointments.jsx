import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, ChevronRight, Activity, 
  Loader2, Calendar, Clock, MapPin, User, Filter, X,
  SlidersHorizontal, CheckCircle2, History, EyeOff, Eye,
  AlertCircle, Check, Stethoscope
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';

// Refined "Pro" Status Styles
const statusStyles = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', stripe: 'bg-amber-400' },
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', stripe: 'bg-emerald-500' },
  'in progress': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', stripe: 'bg-blue-500' },
  completed: { bg: 'bg-zinc-50', text: 'text-zinc-600', border: 'border-zinc-200', stripe: 'bg-zinc-400' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', stripe: 'bg-red-500' },
  'no show': { bg: 'bg-zinc-50', text: 'text-zinc-400', border: 'border-zinc-200', stripe: 'bg-zinc-300' },
};

const statusList = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Appointments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(['All']);
  const [hidePast, setHidePast] = useState(true); 
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Please log in');

      const [apptRes, petsRes] = await Promise.all([
        supabase
          .from('appointments')
          .select(`*, vets!vet_id (name)`)
          .eq('owner_id', user.id)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true }),
        supabase
          .from(TABLES.PETS)
          .select('id, name, species')
          .eq('owner_id', user.id)
      ]);

      if (apptRes.error) throw apptRes.error;
      setAppointments(apptRes.data || []);
      setPets(petsRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load clinical records');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (status) => {
    if (status === 'All') {
      setSelectedStatuses(['All']);
    } else {
      const newStatuses = selectedStatuses.includes(status)
        ? selectedStatuses.filter(s => s !== status)
        : [...selectedStatuses.filter(s => s !== 'All'), status];
      setSelectedStatuses(newStatuses.length === 0 ? ['All'] : newStatuses);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const status = appt.status?.toLowerCase();
    const today = new Date();
    today.setHours(0,0,0,0);
    const apptDate = new Date(appt.scheduled_date);
    
    const isPastDate = apptDate < today;
    const isFinalized = ['completed', 'cancelled', 'no show'].includes(status);

    // LOGIC: Hide if finalized or past date, unless user toggles "Show Past"
    if (hidePast && (isPastDate || isFinalized)) return false;
    
    const petName = pets.find(p => p.id === appt.pet_id)?.name || '';
    const matchesSearch = !searchQuery || 
      appt.service_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.vets?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatuses.includes('All') || 
      selectedStatuses.some(s => s.toLowerCase() === status);
    
    return matchesSearch && matchesStatus;
  });

  const activeFiltersCount = (selectedStatuses.includes('All') ? 0 : selectedStatuses.length) + (searchQuery ? 1 : 0);

  const action = (
    <Link 
      to="/owner/vets" 
      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-200/50"
    >
      <Plus size={14} /> Book New Visit
    </Link>
  );

  if (loading) return (
    <OwnerLayout title="Appointments" description="Your clinical schedule and history" action={action}>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
      </div>
    </OwnerLayout>
  );

  return (
    <OwnerLayout title="Appointments" description="Your clinical schedule and history" action={action}>
      <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-8 antialiased selection:bg-emerald-100">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50/50 p-5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:border-amber-200">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Upcoming Visits</span>
             <div className="text-2xl font-bold tracking-tight mt-3 text-amber-700">
               {appointments.filter(a => ['pending', 'confirmed'].includes(a.status?.toLowerCase())).length}
             </div>
          </div>
          <div className="bg-emerald-50/50 p-5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:border-emerald-200">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Completed Sessions</span>
             <div className="text-2xl font-bold tracking-tight mt-3 text-emerald-700">
               {appointments.filter(a => a.status?.toLowerCase() === 'completed').length}
             </div>
          </div>
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 shadow-sm transition-all hover:border-zinc-300">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total History</span>
             <div className="text-2xl font-bold tracking-tight mt-3 text-zinc-900">{appointments.length}</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by vet, pet, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50/50 border border-zinc-100 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-400"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-xs font-semibold transition-all ${
              showFilters || (selectedStatuses[0] !== 'All')
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <SlidersHorizontal size={14} /> 
            Refine
            {!selectedStatuses.includes('All') && (
              <span className="ml-1 size-4 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {selectedStatuses.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-6 bg-white border border-zinc-200 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-300 shadow-xl shadow-zinc-200/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status Filters</h3>
                <div className="flex flex-wrap gap-2">
                    {statusList.map((status) => (
                        <button
                            key={status}
                            onClick={() => toggleStatus(status)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-md border transition-all ${
                                selectedStatuses.includes(status)
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
              </div>

              <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6">
                 <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Timeline</h3>
                 <button 
                   onClick={() => setHidePast(!hidePast)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                     hidePast ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-zinc-200 text-zinc-500'
                   }`}
                 >
                   {hidePast ? <EyeOff size={14} /> : <Eye size={14} />}
                   {hidePast ? 'Hiding Past History' : 'Showing All History'}
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-3">
            {filteredAppointments.map((appt) => {
              const status = appt.status?.toLowerCase();
              const style = statusStyles[status] || statusStyles.pending;
              const pet = pets.find(p => p.id === appt.pet_id);
              
              return (
                <Link 
                  key={appt.id} 
                  to={`/owner/appointments/${appt.id}`}
                  className="group relative block bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.stripe}`} />
                  
                  <div className="p-4 flex items-center gap-5 ml-1">
                    {/* Date Block */}
                    <div className="hidden sm:flex flex-col items-center justify-center size-12 bg-zinc-50 rounded-lg border border-zinc-100 shrink-0 group-hover:bg-white transition-colors">
                      <span className="text-[9px] font-bold uppercase text-zinc-400">
                        {new Date(appt.scheduled_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-semibold text-zinc-900 leading-none">
                        {new Date(appt.scheduled_date).getDate()}
                      </span>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">
                            {appt.service_type || 'Clinical Session'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1">
                               <Activity size={12} className="text-zinc-300" /> {pet?.name || 'Companion'}
                            </span>
                            <span className="size-1 bg-zinc-200 rounded-full" />
                            <span className="flex items-center gap-1">
                               <MapPin size={11} /> {appt.vets?.name}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${style.bg} ${style.text} ${style.border} shadow-sm`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-zinc-400">
                       <div className="hidden lg:flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase text-zinc-300">Time</span>
                          <span className="text-xs font-semibold text-zinc-600 leading-none mt-1">{appt.scheduled_time?.slice(0, 5)}</span>
                       </div>
                       <div className="size-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-zinc-200 border-dashed p-20 text-center shadow-sm">
            <div className="size-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
              <Calendar size={32} className="text-zinc-200" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">No appointments found</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2 mb-8 leading-relaxed">
               {hidePast ? "We're hiding finalized visits to keep your view clean. Check your filters to see history." : "Your clinical schedule is currently empty."}
            </p>
            {hidePast && (
                <button 
                    onClick={() => setHidePast(false)}
                    className="text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 hover:border-emerald-600 transition-all pb-0.5"
                >
                    View clinical history
                </button>
            )}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}