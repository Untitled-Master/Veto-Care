import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, Calendar, Clock, MapPin, User, 
  PawPrint, Phone, Mail, Check, X, MessageSquare, Stethoscope, FileText, Download, Star
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';
import { toast } from 'sonner';
import { sendOwnerCancelEmail } from '../../lib/email';

const statusColors = {
  pending: { bg: '#FFF3E0', text: '#EF6C00', label: 'Pending', icon: Clock },
  confirmed: { bg: '#E3F2FD', text: '#1976D2', label: 'Confirmed', icon: Check },
  'in progress': { bg: '#E8F5E9', text: '#2BB673', label: 'In Progress', icon: Check },
  completed: { bg: '#E0F2F1', text: '#00897B', label: 'Completed', icon: Check },
  cancelled: { bg: '#FFEBEE', text: '#D32F2F', label: 'Cancelled', icon: X },
  'no show': { bg: '#FCE4EC', text: '#C2185B', label: 'No Show', icon: X },
};

function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function AppointmentView() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Please log in');

      // UPDATED: Fetch from 'appointments' and join pets/vets/utilisateurs in one go
      const { data, error: apptError } = await supabase
        .from('appointments')
        .select(`
          *,
          pets!pet_id (*),
          vets!vet_id (*),
          utilisateurs!owner_id (full_name, phone, email)
        `)
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

      if (apptError) throw apptError;
      setAppointment(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      setCancelling(true);
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;
      setAppointment(prev => ({ ...prev, status: 'cancelled' }));

      // Send cancellation email to vet
      try {
        await sendOwnerCancelEmail(appointment, appointment.pets, appointment.utilisateurs, appointment.vets);
      } catch (emailErr) {
        console.error('Failed to send cancellation email:', emailErr);
      }
    } catch (err) {
      console.error('Error cancelling:', err);
    } finally {
      setCancelling(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    
    try {
      setIsSubmittingRating(true);
      const { error } = await supabase
        .from('appointments')
        .update({ 
          owner_rating: rating,
          owner_review: reviewText || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setAppointment(prev => ({ 
        ...prev, 
        owner_rating: rating,
        owner_review: reviewText 
      }));
      toast.success('Rating submitted successfully!');
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const action = (
    <Link 
      to="/owner/appointments" 
      className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#5F6368] rounded-lg hover:border-[#2BB673] transition-all"
    >
      <ArrowLeft size={18} /> Back
    </Link>
  );

  if (loading) {
    return (
      <OwnerLayout title="Appointment Details" action={action}>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-[#2BB673]" />
          <p className="text-[#5F6368] animate-pulse">Loading appointment...</p>
        </div>
      </OwnerLayout>
    );
  }

  if (error || !appointment) {
    return (
      <OwnerLayout title="Appointment Details" action={action}>
        <div className="text-center py-16">
          <p className="text-red-500 font-bold">{error || 'Appointment not found'}</p>
          <Link to="/owner/appointments" className="text-[#2BB673] hover:underline mt-2 block font-medium">
            Back to appointments
          </Link>
        </div>
      </OwnerLayout>
    );
  }

  const currentStatus = appointment.status?.toLowerCase();
  const statusStyle = statusColors[currentStatus] || statusColors.pending;
  const StatusIcon = statusStyle.icon;

  return (
    <OwnerLayout 
      title={appointment.service_type} 
      description={formatDate(appointment.scheduled_date)}
      action={action}
    >
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        
        {/* Status Banner */}
        <div className="flex items-center gap-3 p-5 rounded-2xl mb-8 border" style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.text + '20' }}>
          <div className="p-2 rounded-lg bg-white shadow-sm">
            <StatusIcon size={24} style={{ color: statusStyle.text }} />
          </div>
          <div>
            <div className="font-black text-sm uppercase tracking-wider" style={{ color: statusStyle.text }}>
              {statusStyle.label}
            </div>
            <div className="text-sm text-black/70 font-medium">
              {currentStatus === 'pending' && 'Waiting for vet confirmation'}
              {currentStatus === 'confirmed' && 'Your appointment is confirmed'}
              {currentStatus === 'completed' && 'Appointment completed'}
              {currentStatus === 'cancelled' && 'This appointment was cancelled'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details Card */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
                <Stethoscope size={20} className="text-[#2BB673]" />
                Visit Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-black/40 uppercase">Date</div>
                    <div className="font-bold text-black">{formatDate(appointment.scheduled_date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-black/40 uppercase">Time</div>
                    <div className="font-bold text-black">{formatTime(appointment.scheduled_time)}</div>
                  </div>
                </div>
              </div>

              {appointment.reason && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-black/40 uppercase mb-2">Owner's Reason</div>
                  <div className="text-black font-medium leading-relaxed">{appointment.reason}</div>
                </div>
              )}

              {appointment.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 uppercase mb-2">
                    <MessageSquare size={14} /> Vet Notes
                  </div>
                  <div className="text-black font-medium">{appointment.notes}</div>
                </div>
              )}

              {/* Medical History Section */}
              {appointment.medical_history && Array.isArray(appointment.medical_history) && appointment.medical_history.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-[#2BB673]" />
                    Attached Medical Records
                  </h3>
                  <div className="space-y-3">
                    {appointment.medical_history.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] hover:border-[#2BB673] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-[#E5E7EB]">
                            <FileText size={18} className="text-[#EF4444]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black">{record.title || record.name || 'Medical Record'}</p>
                            {record.record_type && (
                              <span className="text-[10px] font-bold uppercase text-[#2BB673] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                                {record.record_type}
                              </span>
                            )}
                          </div>
                        </div>
                        {record.url && (
                          <a 
                            href={record.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-sm font-bold text-black rounded-lg hover:bg-[#F1F3F4] transition-colors"
                          >
                            <Download size={16} className="text-[#2BB673]" />
                            View PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pet Card */}
            {appointment.pets && (
              <Link to={`/owner/pets/${appointment.pets.id}`} className="block bg-white rounded-3xl border border-[#E5E7EB] p-6 hover:border-[#2BB673] transition-all group shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100">
                      {appointment.pets.image_url ? (
                        <img src={appointment.pets.image_url} alt="Pet" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/20 font-black">PET</div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-black/40 uppercase">Patient</div>
                      <div className="font-bold text-black text-lg group-hover:text-[#2BB673]">{appointment.pets.name}</div>
                      <div className="text-black/60 text-sm">{appointment.pets.breed || appointment.pets.species}</div>
                    </div>
                  </div>
                  <PawPrint size={24} className="text-gray-100 group-hover:text-[#2BB673]/20 transition-colors" />
                </div>
              </Link>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Vet Card */}
            {appointment.vets && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-black uppercase mb-4 tracking-wider">Veterinarian</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#2BB673] overflow-hidden border border-emerald-100">
                    {appointment.vets.profile_pic_url ? (
                      <img src={appointment.vets.profile_pic_url} alt="Vet" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-black">{appointment.vets.name}</div>
                    <div className="text-xs text-black/60 flex items-center gap-1">
                      <MapPin size={12} /> {appointment.vets.wilaya}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-black rounded-xl text-xs font-bold border border-gray-100 transition-colors">
                    <Phone size={14} /> Contact Clinic
                  </button>
                  <Link to={`/owner/vets/${appointment.vets.id}`} className="w-full flex items-center justify-center py-2.5 bg-black text-white rounded-xl text-xs font-bold transition-transform active:scale-95">
                    View Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Actions */}
            {['pending', 'confirmed'].includes(currentStatus) && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm border-t-4 border-t-red-500">
                <h3 className="font-bold text-black mb-3 text-sm">Need to cancel?</h3>
                <p className="text-xs text-black/60 mb-4 font-medium">Please only cancel if absolutely necessary. You can book a new slot later.</p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-100 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancelling ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                  Cancel Booking
                </button>
              </div>
            )}

            {/* Rating Section - Only show for completed appointments without rating */}
            {currentStatus === 'completed' && !appointment.owner_rating && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm border-t-4 border-t-[#2BB673]">
                <h3 className="font-bold text-black mb-4 text-sm">Rate Your Experience</h3>
                <p className="text-xs text-black/60 mb-4">How was your appointment with {appointment.vets?.name}?</p>
                
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        size={28} 
                        className={`${
                          star <= (hoverRating || rating) 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-bold text-black">{rating}/5</span>
                  )}
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write a review (optional)..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2BB673]/20 focus:border-[#2BB673] resize-none mb-4"
                />

                 <button
                  onClick={handleRatingSubmit}
                  disabled={rating === 0 || isSubmittingRating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2BB673] text-white font-bold rounded-xl hover:bg-[#228B22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingRating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Submit Rating
                </button>
              </div>
            )}

            {/* Display existing rating */}
            {appointment.owner_rating && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-sm">
                <h3 className="font-bold text-black mb-4 text-sm">Your Rating</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={20} 
                        className={star <= appointment.owner_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-black">{appointment.owner_rating}/5</span>
                </div>
                {appointment.owner_review && (
                  <p className="text-sm text-black/70 italic bg-[#F8FAFC] p-3 rounded-lg">"{appointment.owner_review}"</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </OwnerLayout>
  );
}