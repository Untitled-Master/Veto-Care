import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, Calendar, Clock, MapPin, User, 
  PawPrint, Phone, Check, X, MessageSquare, Stethoscope, 
  FileText, Download, Star, ChevronRight, Activity,
  CheckCircle2, AlertCircle, Save, ShieldCheck, History
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { sendVetConfirmationEmail, sendVetDeclineEmail } from '@/lib/email';

// High-end Status Configuration
const statusStyles = {
  pending: { 
    bg: 'bg-amber-50/50', 
    border: 'border-amber-100', 
    text: 'text-amber-700', 
    label: 'Pending Confirmation', 
    icon: Clock,
    description: 'Waiting for your clinical confirmation.'
  },
  confirmed: { 
    bg: 'bg-emerald-50/50', 
    border: 'border-emerald-200', 
    text: 'text-emerald-700', 
    label: 'Confirmed', 
    icon: CheckCircle2,
    description: 'This appointment is scheduled and active.'
  },
  'in progress': { 
    bg: 'bg-blue-50/50', 
    border: 'border-blue-200', 
    text: 'text-blue-700', 
    label: 'In Progress', 
    icon: Stethoscope,
    description: 'The patient is currently being seen.'
  },
  completed: { 
    bg: 'bg-zinc-50', 
    border: 'border-zinc-200', 
    text: 'text-zinc-600', 
    label: 'Visit Completed', 
    icon: Check,
    description: 'Clinical session has been finalized.'
  },
  cancelled: { 
    bg: 'bg-red-50/50', 
    border: 'border-red-100', 
    text: 'text-red-600', 
    label: 'Cancelled', 
    icon: X,
    description: 'This appointment was removed from the schedule.'
  },
  'no show': { 
    bg: 'bg-zinc-100/50', 
    border: 'border-zinc-200', 
    text: 'text-zinc-500', 
    label: 'No Show', 
    icon: AlertCircle,
    description: 'The client did not arrive for the appointment.'
  },
};

export default function VetAppointmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Please log in');

      const { data, error: apptError } = await supabase
        .from('appointments')
        .select(`
          *,
          pets!pet_id (*),
          utilisateurs!owner_id (full_name, phone, email),
          vets!vet_id (*)
        `)
        .eq('id', id)
        .eq('vet_id', user.id)
        .single();

      if (apptError) throw apptError;
      setAppointment(data);
      setNotes(data.notes || '');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    const toastId = toast.loading('Updating status...');
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      setAppointment(prev => ({ ...prev, status: newStatus }));
      toast.success(`Appointment marked as ${newStatus}`, { id: toastId });

      // Send appropriate email based on status change
      try {
        if (newStatus === 'confirmed') {
          await sendVetConfirmationEmail(appointment, appointment.pets, appointment.utilisateurs, appointment.vets);
        } else if (newStatus === 'cancelled') {
          await sendVetDeclineEmail(appointment, appointment.pets, appointment.utilisateurs, appointment.vets, 'Le vétérinaire n\'est pas disponible sur ce créneau.');
        }
      } catch (emailErr) {
        console.error('Failed to send status update email:', emailErr);
      }
    } catch (err) {
      toast.error('Update failed', { id: toastId });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNotes = async () => {
    const toastId = toast.loading('Saving clinical notes...');
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ notes, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      setAppointment(prev => ({ ...prev, notes }));
      toast.success('Clinical notes updated', { id: toastId });
    } catch (err) {
      toast.error('Failed to save notes', { id: toastId });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="size-8 animate-spin text-emerald-600" />
      <p className="text-zinc-500 text-sm font-medium animate-pulse">Retrieving appointment details...</p>
    </div>
  );

  if (error || !appointment) return (
    <div className="max-w-2xl mx-auto py-20 text-center px-6">
      <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-zinc-900">{error || 'Appointment record not found'}</h3>
      <button onClick={() => navigate('/vet/dashboard/appointments')} className="mt-4 text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1">
        <ArrowLeft size={16} /> Return to schedule
      </button>
    </div>
  );

  const currentStatus = appointment.status?.toLowerCase() || 'pending';
  const style = statusStyles[currentStatus] || statusStyles.pending;
  const StatusIcon = style.icon;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100">
      
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/vet/dashboard/appointments')}
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <div className="size-7 rounded-md border border-zinc-200 flex items-center justify-center bg-white group-hover:border-zinc-300 shadow-sm transition-all">
            <ArrowLeft size={14} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back to schedule</span>
        </button>
      </div>

      {/* DYNAMIC STATUS BANNER */}
      <div className={`
        flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl border transition-all duration-500
        ${style.bg} ${style.border} mb-10
      `}>
        <div className="flex items-center gap-4">
          <div className={`size-12 rounded-lg bg-white flex items-center justify-center shadow-sm border ${style.border} ${style.text}`}>
            <StatusIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight leading-none">
              {appointment.pets?.name || 'Patient'} Visit
            </h1>
            <div className="flex items-center gap-2 mt-2">
               <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>
                {style.label}
              </span>
              <span className="size-1 bg-zinc-300 rounded-full" />
              <p className="text-xs text-zinc-500 font-medium">
                {style.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentStatus === 'pending' && (
            <button 
              onClick={() => updateStatus('confirmed')}
              disabled={updatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-emerald-200/50 flex items-center gap-2"
            >
              {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Confirm Visit
            </button>
          )}
          
          {currentStatus === 'confirmed' && (
             <button 
              onClick={() => updateStatus('completed')}
              disabled={updatingStatus}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
             >
               {updatingStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
               Complete Session
             </button>
          )}

          {currentStatus === 'pending' && (
            <button
                onClick={() => updateStatus('cancelled')}
                disabled={updatingStatus}
                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all"
            >
                Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Clinical Details */}
          <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden transition-all hover:border-zinc-300">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-2">
              <Stethoscope size={16} className="text-zinc-400" />
              <h3 className="font-semibold text-zinc-900 text-sm">Clinical Details</h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Scheduled Date</span>
                <div className="flex items-center gap-2 text-zinc-900 font-medium">
                   <Calendar size={14} className="text-zinc-300" />
                   {formatDate(appointment.scheduled_date)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Appointment Time</span>
                <div className="flex items-center gap-2 text-zinc-900 font-medium">
                   <Clock size={14} className="text-zinc-300" />
                   {formatTime(appointment.scheduled_time)}
                </div>
              </div>
              <div className="col-span-full space-y-1 pt-4 border-t border-zinc-50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reason for visit</span>
                <p className="text-zinc-600 text-sm italic leading-relaxed">
                   "{appointment.reason || appointment.notes || 'Routine clinical examination.'}"
                </p>
              </div>
              {appointment.service_type && (
                <div className="col-span-full space-y-1 pt-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Service Type</span>
                  <div className="text-zinc-900 font-medium text-sm">{appointment.service_type}</div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Medical History */}
          {appointment.medical_history?.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <FileText size={16} className="text-emerald-600" />
                <h3 className="text-sm font-semibold text-zinc-900">Attached Medical Records</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {appointment.medical_history.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-200 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100 text-red-500 shadow-sm">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{record.title || record.name || 'Medical Record'}</p>
                        <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {record.record_type || 'PDF DOCUMENT'}
                        </span>
                      </div>
                    </div>
                    {record.url && (
                      <a 
                        href={record.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all border border-transparent hover:border-emerald-100"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Clinical Notes Area */}
          {currentStatus !== 'cancelled' && (
            <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-zinc-400" />
                  <h3 className="font-semibold text-zinc-900 text-sm">Clinical Observations</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 rounded text-[9px] font-bold text-zinc-500 uppercase">
                   <ShieldCheck size={10} /> Private
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record diagnosis, prescriptions, or follow-up instructions..."
                  rows={6}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none placeholder:text-zinc-400"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={saveNotes}
                    className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Save size={14} /> Update clinical record
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Patient Widget */}
          <Link 
            to={`/vet/dashboard/pets/${appointment.pets?.id}`}
            className="block bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Patient Summary</span>
               <ChevronRight size={14} className="text-zinc-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden shadow-inner shrink-0">
                {appointment.pets?.image_url ? (
                  <img src={appointment.pets.image_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center text-zinc-300 font-bold text-[10px]">PET</div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors truncate">{appointment.pets?.name}</h4>
                <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tighter">{appointment.pets?.species}</p>
                <p className="text-[11px] text-zinc-400 truncate">{appointment.pets?.breed || 'Breed unassigned'}</p>
              </div>
            </div>
          </Link>

          {/* Owner Widget */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Client Contact</span>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-zinc-900 text-sm truncate">{appointment.utilisateurs?.full_name}</h4>
                <p className="text-[11px] text-zinc-400 truncate font-medium">{appointment.utilisateurs?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {appointment.utilisateurs?.phone && (
                <a 
                  href={`tel:${appointment.utilisateurs.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 rounded-lg text-xs font-semibold border border-zinc-200 transition-colors"
                >
                  <Phone size={14} className="text-zinc-400" /> Call {appointment.utilisateurs.phone}
                </a>
              )}
              <a 
                href={`mailto:${appointment.utilisateurs?.email}`}
                className="flex items-center justify-center w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-transform active:scale-[0.98]"
              >
                Send Message
              </a>
            </div>
          </div>

          {/* Rating Widget */}
          {appointment.owner_rating && (
            <div className="bg-amber-50/30 rounded-xl border border-amber-100 p-5 shadow-sm">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mb-3">Owner Feedback</span>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < appointment.owner_rating ? "currentColor" : "none"} className={i < appointment.owner_rating ? "" : "text-zinc-200"} />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-900">{appointment.owner_rating}/5</span>
              </div>
              {appointment.owner_review && (
                <p className="text-xs text-zinc-600 italic leading-relaxed p-3 bg-white/50 rounded-lg border border-amber-100/50">
                  "{appointment.owner_review}"
                </p>
              )}
            </div>
          )}

          {/* Timestamp Widget */}
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4">
             <div className="flex items-center gap-2 text-zinc-400">
                <History size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Record history</span>
             </div>
             <div className="mt-3 space-y-2">
                <div className="flex justify-between text-[11px]">
                   <span className="text-zinc-500">Created</span>
                   <span className="text-zinc-900 font-medium">{appointment.created_at ? new Date(appointment.created_at).toLocaleDateString() : '---'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-zinc-500">Last Update</span>
                   <span className="text-zinc-900 font-medium">{appointment.updated_at ? new Date(appointment.updated_at).toLocaleDateString() : '---'}</span>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}