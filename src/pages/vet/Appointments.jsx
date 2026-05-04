import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Phone,
  User as UserIcon,
  Stethoscope,
  ClipboardList,
  ChevronRight,
  History
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VetAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          pets!pet_id (
            name, 
            species, 
            breed, 
            image_url
          ), 
          utilisateurs!owner_id (
            full_name, 
            phone
          )
        `)
        .eq('vet_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const toastId = toast.loading(`Updating status...`);
    try {
      setUpdatingId(id);
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus.toLowerCase(), updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Appointment ${newStatus}`, { id: toastId });
      loadAppointments();
    } catch (error) {
      toast.error('Update failed', { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const base = "px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider";
    const styles = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      completed: 'bg-zinc-50 text-zinc-600 border-zinc-200',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
      <span className={`${base} ${styles[s] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const filteredAppointments = statusFilter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status?.toLowerCase() === statusFilter.toLowerCase());

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="size-8 animate-spin text-emerald-600" />
      <p className="text-zinc-500 text-sm font-medium animate-pulse">Syncing schedule...</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Schedule</h1>
          <p className="text-zinc-500 text-sm">Monitor and manage your clinical appointments.</p>
        </div>
        
        {/* Modern Segmented Filter */}
        <div className="inline-flex p-1 bg-zinc-100 rounded-lg border border-zinc-200">
          {['all', 'Pending', 'Confirmed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status.toLowerCase())}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                statusFilter === status.toLowerCase()
                  ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {status === 'all' ? 'All view' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Feed */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 border-dashed p-20 text-center">
            <div className="size-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
              <Calendar className="text-zinc-300" size={24} />
            </div>
            <p className="text-zinc-900 font-semibold">No appointments found</p>
            <p className="text-zinc-500 text-sm mt-1">Your schedule is currently clear for this filter.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div 
              key={apt.id}
              className="group relative bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  
                  {/* Column 1: Pet Summary */}
                  <div className="flex items-center gap-4 min-w-[280px]">
        
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-zinc-900 truncate">{apt.utilisateurs?.full_name || 'Unknown Patient'}</h4>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400 uppercase tracking-tight">
                        <span>{apt.pets?.species}</span>
                        {apt.pets?.breed && (
                          <>
                            <span className="size-1 bg-zinc-200 rounded-full" />
                            <span className="truncate">{apt.pets.breed}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Date & Time - Vercel Style Labeling */}
                  <div className="flex items-center gap-6 lg:border-l lg:border-zinc-100 lg:pl-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar size={14} className="text-zinc-400" />
                        <span className="text-sm font-medium">{apt.scheduled_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Clock size={14} className="text-zinc-400" />
                        <span className="text-sm font-medium">{apt.scheduled_time}</span>
                      </div>
                    </div>
                    <div className="hidden xl:block h-8 w-px bg-zinc-100 mx-2" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <UserIcon size={14} className="text-zinc-400" />
                        <span className="text-sm font-medium truncate max-w-[120px]">{apt.utilisateurs?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Phone size={14} className="text-zinc-400" />
                        <span className="text-sm font-medium">{apt.utilisateurs?.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Medical Reason */}
                  <div className="flex-1 min-w-0 lg:border-l lg:border-zinc-100 lg:pl-8">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Stethoscope size={14} className="text-emerald-600" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{apt.service_type || 'Clinical Visit'}</span>
                    </div>
                    <p className="text-sm text-zinc-600 line-clamp-1 italic">
                      "{apt.reason || apt.notes || 'Routine checkup'}"
                    </p>
                  </div>

                  {/* Column 4: Actions - Shadcn Style Buttons */}
                  <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
                    {apt.status?.toLowerCase() === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(apt.id, 'Confirmed')}
                          disabled={updatingId === apt.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, 'Cancelled')}
                          disabled={updatingId === apt.id}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}

                    {apt.status?.toLowerCase() === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(apt.id, 'Completed')}
                        disabled={updatingId === apt.id}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                      >
                        <ClipboardList size={14} />
                        Mark Complete
                      </button>
                    )}

                    {(apt.status?.toLowerCase() === 'completed' || apt.status?.toLowerCase() === 'cancelled') && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 rounded-lg text-zinc-400 border border-zinc-100 font-medium text-[10px] uppercase tracking-tighter">
                         <History size={12} /> Archived
                      </div>
                    )}
                    
                    <Link 
                      to={`/vet/dashboard/appointments/${apt.id}`}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}