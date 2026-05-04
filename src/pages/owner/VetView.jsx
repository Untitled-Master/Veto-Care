import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Loader2, MapPin, Star, Clock, Award, Phone, Mail, 
  Calendar, Check, ChevronRight, User, PawPrint
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';
import { sendAppointmentEmails } from '../../lib/email';

function StarRating({ rating, count, size = 16 }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map((star) => (
          <Star 
            key={star}
            size={size} 
            className={star <= fullStars ? 'fill-yellow-400 text-yellow-400' : star === fullStars + 1 && hasHalf ? 'fill-yellow-400/50 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-[#202124]">{rating}</span>
      {count > 0 && <span className="text-xs text-[#9CA3AF]">({count} reviews)</span>}
    </div>
  );
}

function formatWorkingHours(hours) {
  if (!hours) return [];
  try {
    const parsed = typeof hours === 'string' ? JSON.parse(hours) : hours;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      hours: parsed[day] || 'Closed'
    }));
  } catch {
    return [];
  }
}

function getIsOpen(hours) {
  if (!hours) return false;
  try {
    const parsed = typeof hours === 'string' ? JSON.parse(hours) : hours;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayHours = parsed[today];
    
    if (!todayHours || todayHours.toLowerCase() === 'closed') return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openTime, closeTime] = todayHours.split('-');
    const [openHour, openMin] = openTime.trim().split(':').map(Number);
    const [closeHour, closeMin] = closeTime.trim().split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } catch {
    return false;
  }
}

export default function VetView() {
  const { id } = useParams();
  const [vet, setVet] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    fetchData();
    fetchMedicalRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMedicalRecords = async () => {
    try {
      setLoadingRecords(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: petsData } = await supabase
        .from(TABLES.PETS)
        .select('id')
        .eq('owner_id', user.id);

      if (!petsData || petsData.length === 0) return;

      const petIds = petsData.map(p => p.id);

      const { data, error } = await supabase
        .from(TABLES.MEDICAL_RECORDS)
        .select('id, title, record_type, attachments')
        .in('pet_id', petIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (err) {
      console.error('Error fetching medical records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [vetRes, { data: { user } }] = await Promise.all([
        supabase.from(TABLES.VETS).select('*').eq('id', id).single(),
        supabase.auth.getUser()
      ]);

      if (vetRes.error) throw vetRes.error;
      setVet(vetRes.data);

      if (user) {
        const petsRes = await supabase.from(TABLES.PETS).select('id, name, species').eq('owner_id', user.id);
        setPets(petsRes.data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load vet profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    
    try {
      setBookingLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const petId = selectedPet || pets[0]?.id;
      
      // FIXED: Targeted the 'appointments' table and updated field names to match your new SQL schema
      const medicalHistory = selectedRecords.length > 0 ? medicalRecords
        .filter(record => selectedRecords.includes(record.id))
        .map(record => ({
          id: record.id,
          title: record.title,
          record_type: record.record_type,
          url: record.attachments?.[0]?.url || null,
          name: record.attachments?.[0]?.name || 'Medical Record'
        })) : null;

      const { data: newAppointment, error: insertError } = await supabase.from('appointments').insert({
        owner_id: user.id,
        pet_id: petId,
        vet_id: vet.id, // References vets(id)
        service_type: selectedService,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        status: 'pending', // Matches SQL check constraint (lowercase)
        notes: notes || null,
        medical_history: medicalHistory
      }).select().single();

      if (insertError) throw insertError;

      // Update vet's booked_hours
      const currentBookedHours = vet.booked_hours ? (typeof vet.booked_hours === 'string' ? JSON.parse(vet.booked_hours) : vet.booked_hours) : {};
      const dateKey = selectedDate;
      const currentDayBooked = currentBookedHours[dateKey] || [];
      const updatedBookedHours = {
        ...currentBookedHours,
        [dateKey]: [...currentDayBooked, selectedTime]
      };

      console.log('Updating booked_hours:', { dateKey, selectedTime, updatedBookedHours, vetId: vet.id });
      
      const { error: rpcError } = await supabase.rpc('update_vet_booked_hours', {
        p_vet_id: vet.id,
        p_booked_hours: updatedBookedHours
      });

      if (rpcError) {
        await supabase
          .from(TABLES.VETS)
          .update({ booked_hours: updatedBookedHours })
          .eq('id', vet.id);
      }

      // Refresh vet data to get updated booked_hours
      const { data: refreshedVet } = await supabase.from(TABLES.VETS).select('*').eq('id', vet.id).single();
      if (refreshedVet) setVet(refreshedVet);

      // Get owner profile
      const { data: ownerProfile } = await supabase.from('utilisateurs').select('*').eq('id', user.id).single();
      const selectedPetData = pets.find(p => p.id === petId) || pets[0];

      // Send confirmation emails
      await sendAppointmentEmails(newAppointment, selectedPetData, ownerProfile, vet);

      setBookingSuccess(true);
      setSelectedRecords([]); // Reset selected medical records
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const services = vet?.services 
    ? (Array.isArray(vet.services) ? vet.services : JSON.parse(vet.services))
    : ['General Checkup', 'Vaccination', 'Surgery', 'Dental Cleaning', 'X-Ray', 'Blood Tests'];

  const timeSlotData = useMemo(() => {
    const bookedHours = vet?.booked_hours ? (typeof vet.booked_hours === 'string' ? JSON.parse(vet.booked_hours) : vet.booked_hours) : {};
    const dateToCheck = selectedDate || new Date().toISOString().split('T')[0];
    const bookedForDay = bookedHours[dateToCheck] || [];
    
    if (!vet?.working_hours) return { slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'], booked: [] };
    
    try {
      const parsed = typeof vet.working_hours === 'string' ? JSON.parse(vet.working_hours) : vet.working_hours;
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      
      let dayToCheck;
      if (selectedDate) {
        const dateObj = new Date(selectedDate);
        dayToCheck = days[dateObj.getDay()];
      } else {
        dayToCheck = days[new Date().getDay()];
      }
      
      const todayHours = parsed[dayToCheck];
      
      if (!todayHours || todayHours.toLowerCase() === 'closed') return { slots: [], booked: bookedForDay };
      
      const [openTime, closeTime] = todayHours.split('-');
      const [openHour, openMin] = openTime.trim().split(':').map(Number);
      const [closeHour, closeMin] = closeTime.trim().split(':').map(Number);
      
      const slots = [];
      let currentHour = openHour;
      let currentMin = openMin;
      
      while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
        slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin = 0;
        }
      }
      
      return { slots, booked: bookedForDay };
    } catch {
      return { slots: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'], booked: [] };
    }
  }, [vet?.working_hours, vet?.booked_hours, selectedDate]);

  const { slots: timeSlots, booked: bookedTimes } = timeSlotData;
  const workingHours = formatWorkingHours(vet?.working_hours);

  const action = (
    <Link 
      to="/owner/vets" 
      className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-[#5F6368] rounded-lg hover:border-[#2BB673] transition-all"
    >
      <ArrowLeft size={18} /> Back
    </Link>
  );

  if (loading) {
    return (
      <OwnerLayout title="Vet Profile" action={action}>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-[#2BB673]" />
          <p className="text-[#5F6368] animate-pulse">Loading profile...</p>
        </div>
      </OwnerLayout>
    );
  }

  if (error || !vet) {
    return (
      <OwnerLayout title="Vet Profile" action={action}>
        <div className="text-center py-16">
          <p className="text-red-500">{error || 'Vet not found'}</p>
          <Link to="/owner/vets" className="text-[#2BB673] hover:underline mt-2 block">
            Back to vets
          </Link>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title={vet.name} description={`${vet.wilaya}, ${vet.commune}`} action={action}>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        
        {bookingSuccess ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB]">
            <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} className="text-[#2BB673]" />
            </div>
            <h2 className="text-2xl font-bold text-[#202124] mb-2">Booking Request Sent!</h2>
            <p className="text-[#5F6368] mb-6">
              Your appointment request has been sent to {vet.name}.<br/>
              You'll receive a confirmation once they review it.
            </p>
            <div className="flex justify-center gap-3">
              <Link 
                to="/owner/appointments" 
                className="px-6 py-2 bg-[#2BB673] text-white font-medium rounded-lg hover:bg-[#228B22]"
              >
                View Appointments
              </Link>
              <Link 
                to="/owner/vets" 
                className="px-6 py-2 border border-[#E5E7EB] text-[#202124] font-medium rounded-lg hover:bg-[#F8F8F8]"
              >
                Find Another Vet
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <div className="flex items-start gap-5">
                  <div className="w-24 h-24 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-[#2BB673] text-3xl font-bold overflow-hidden flex-shrink-0">
                    {vet.profile_pic_url ? (
                      <img src={vet.profile_pic_url} alt={vet.name} className="w-full h-full object-cover" />
                    ) : (
                      vet.name?.charAt(0)
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-[#202124]">{vet.name}</h1>
                    <div className="flex items-center gap-2 text-[#5F6368] mt-1">
                      <MapPin size={16} /> {vet.commune}, {vet.wilaya}
                    </div>
                    <StarRating rating={vet.rating} count={vet.review_count} />
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      getIsOpen(vet.working_hours) 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${getIsOpen(vet.working_hours) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      {getIsOpen(vet.working_hours) ? 'Open Now' : 'Closed'}
                    </div>
                  </div>
                </div>

                {vet.bio && (
                  <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                    <h3 className="font-semibold text-[#202124] mb-2">About</h3>
                    <p className="text-[#5F6368] text-sm leading-relaxed">{vet.bio}</p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {vet.phone && (
                    <div className="flex items-center gap-2 text-sm text-[#5F6368]">
                      <Phone size={16} className="text-[#2BB673]" /> {vet.phone}
                    </div>
                  )}
                  {vet.email && (
                    <div className="flex items-center gap-2 text-sm text-[#5F6368]">
                      <Mail size={16} className="text-[#2BB673]" /> {vet.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#5F6368]">
                    <Award size={16} className="text-[#2BB673]" /> {vet.experience_years} years experience
                  </div>
                </div>
              </div>

              {vet.specialties && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                  <h3 className="font-semibold text-[#202124] mb-4">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(vet.specialties) ? vet.specialties : JSON.parse(vet.specialties)).map((spec, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#E8F5E9] text-[#00897B] text-sm font-medium rounded-lg">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h3 className="font-semibold text-[#202124] mb-4">Services Offered</h3>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-[#5F6368]">
                      <Check size={14} className="text-[#2BB673]" /> {service}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <h3 className="font-semibold text-[#202124] mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-[#2BB673]" /> Working Hours
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {workingHours.map((day, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[#5F6368]">{day.day}</span>
                      <span className={`font-medium ${day.hours === 'Closed' ? 'text-red-400' : 'text-[#202124]'}`}>
                        {day.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[#202124] mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-[#2BB673]" /> Book Appointment
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-2">Service *</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full text-[#5F6368] px-3 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2BB673]"
                    >
                      <option value="">Select a service</option>
                      {services.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {pets.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-[#5F6368] mb-2">Select Pet</label>
                      <select
                        value={selectedPet}
                        onChange={(e) => setSelectedPet(e.target.value)}
                        className="w-full text-[#5F6368] px-3 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2BB673]"
                      >
                        <option value="">Select your pet</option>
                        {pets.map((pet) => (
                          <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-2">Date *</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full text-[#5F6368] px-3 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2BB673]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-2">Time *</label>
                    {timeSlots.length === 0 ? (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
                        The clinic is closed today. No available time slots.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => {
                          const isBooked = bookedTimes.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedTime(time)}
                              className={`px-2 py-2 text-xs font-medium rounded-lg border transition-all ${
                                selectedTime === time
                                  ? 'bg-[#2BB673] text-white border-[#2BB673]'
                                  : isBooked
                                    ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through'
                                    : 'bg-[#F8FAFC] border-[#E5E7EB] text-[#5F6368] hover:border-[#2BB673]'
                              }`}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-2">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe symptoms..."
                      rows={3}
                      className="w-full text-[#5F6368] px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2BB673] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#5F6368] mb-2">Attach Medical History (optional)</label>
                    {loadingRecords ? (
                      <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-center text-xs text-[#5F6368]">
                        Loading medical records...
                      </div>
                    ) : medicalRecords.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto space-y-2 border border-[#E5E7EB] rounded-lg p-2 bg-[#F8FAFC]">
                        {medicalRecords.map((record) => (
                          <label key={record.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRecords([...selectedRecords, record.id]);
                                } else {
                                  setSelectedRecords(selectedRecords.filter(id => id !== record.id));
                                }
                              }}
                              className="rounded border-[#E5E7EB] text-[#2BB673] focus:ring-[#2BB673]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-black truncate">{record.title}</p>
                              <p className="text-[10px] text-[#5F6368]">{record.record_type}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9CA3AF] p-2">No medical records found. <Link to="/owner/pets" className="text-[#2BB673] hover:underline">Add a pet first</Link></p>
                    )}
                    {selectedRecords.length > 0 && (
                      <p className="text-xs text-[#2BB673] mt-1">{selectedRecords.length} record(s) selected</p>
                    )}
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={!selectedService || !selectedDate || !selectedTime || bookingLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2BB673] text-white font-medium rounded-lg hover:bg-[#228B22] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>Confirm Booking <ChevronRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}