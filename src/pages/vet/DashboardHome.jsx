import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
  Users,
  ClipboardList,
  Stethoscope,
  Building2,
  MapPin,
  Star,
  ChevronRight,
  Activity,
  User as UserIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VetDashboardHome() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    totalPets: 0,
    rating: 0,
    reviewCount: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [vetProfile, setVetProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, appointmentsRes, reviewsRes] = await Promise.all([
        supabase.from('vets').select('*').eq('id', user.id).maybeSingle(),
        supabase
          .from('appointments')
          .select(`
            *,
            pets!pet_id (name, species, breed, image_url),
            utilisateurs!owner_id (full_name, phone)
          `)
          .eq('vet_id', user.id),
        supabase
          .from('appointments')
          .select(`
            owner_rating,
            owner_review,
            scheduled_date,
            utilisateurs!owner_id (full_name)
          `)
          .eq('vet_id', user.id)
          .not('owner_rating', 'is', null)
          .order('scheduled_date', { ascending: false })
          .limit(5)
      ]);

      const { data: appointments, error } = appointmentsRes;
      if (error) throw error;

      const total = appointments?.length || 0;
      const pending = appointments?.filter(a => a.status?.toLowerCase() === 'pending').length || 0;
      const confirmed = appointments?.filter(a => a.status?.toLowerCase() === 'confirmed').length || 0;
      const completed = appointments?.filter(a => a.status?.toLowerCase() === 'completed').length || 0;
      
      const uniquePets = new Set(appointments?.map(a => a.pet_id).filter(Boolean));
      const totalPets = uniquePets.size;

      const vetData = profileRes.data;
      setVetProfile(vetData);

      setStats({ 
        total, 
        pending, 
        confirmed, 
        completed, 
        totalPets,
        rating: vetData?.rating || 0,
        reviewCount: vetData?.review_count || 0
      });

      const today = new Date().toISOString().split('T')[0];
      const upcoming = (appointments || [])
        .filter(a => {
          const isUpcoming = a.scheduled_date >= today;
          const isActive = a.status?.toLowerCase() === 'pending' || a.status?.toLowerCase() === 'confirmed';
          return isUpcoming && isActive;
        })
        .sort((a, b) => {
          if (a.scheduled_date !== b.scheduled_date) {
            return a.scheduled_date.localeCompare(b.scheduled_date);
          }
          return a.scheduled_time.localeCompare(b.scheduled_time);
        })
        .slice(0, 5);

      setRecentAppointments(upcoming);
      setRecentReviews(reviewsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const styles = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      completed: 'bg-zinc-50 text-zinc-600 border-zinc-200',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[s] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Building your overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 text-sm font-medium">Clinic performance and upcoming schedule overview.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link 
                to="/vet/dashboard/appointments" 
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
                <Calendar size={14} /> 
                View Full Schedule
            </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
            { label: 'Total Visits', value: stats.total, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Queue', value: stats.pending + stats.confirmed, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Patient Retention', value: stats.totalPets, icon: Users, color: 'text-zinc-600', bg: 'bg-zinc-50' },
            { label: 'Avg Rating', value: stats.rating || '5.0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50/50' }
        ].map((item) => (
            <div key={item.label} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between group hover:border-zinc-300 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.label}</span>
                    <div className={`p-1.5 rounded-lg ${item.bg} ${item.color}`}>
                        <item.icon size={16} />
                    </div>
                </div>
                <div className="mt-3">
                    <span className="text-2xl font-semibold text-zinc-900 tracking-tight">{item.value}</span>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Queue Feed */}
        <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-emerald-600" />
                    <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">Today's Appointments</h3>
                </div>
                <Link to="/vet/dashboard/appointments" className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight hover:text-emerald-700">
                    See All
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm divide-y divide-zinc-100 overflow-hidden">
                {recentAppointments.length === 0 ? (
                    <div className="p-16 text-center">
                        <Calendar className="mx-auto mb-3 text-zinc-200" size={32} />
                        <p className="text-zinc-500 text-sm font-medium">Your queue is empty today.</p>
                    </div>
                ) : (
                    recentAppointments.map((apt) => (
                        <Link 
                            key={apt.id} 
                            to={`/vet/dashboard/appointments/${apt.id}`}
                            className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-11 rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0 shadow-sm">
                                    {apt.pets?.image_url ? (
                                        <img src={apt.pets.image_url} alt="" className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full flex items-center justify-center text-zinc-300 font-bold text-[8px]">PET</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-zinc-900 text-sm leading-none">{apt.utilisateurs?.full_name}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">{apt.pets?.species}</span>
                                        <span className="text-[11px] text-zinc-500 font-medium">{apt.scheduled_time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs font-medium text-zinc-600">{apt.service_type || 'General'}</p>
                                </div>
                                {getStatusBadge(apt.status)}
                                <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>

        {/* Info Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">

            {/* Profile Widget */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden transition-all hover:border-zinc-300">
                <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/30 flex items-center gap-2">
                    <UserIcon size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">My Practice</span>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <Stethoscope size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">{vetProfile?.name || 'Veterinarian'}</p>
                            <p className="text-[11px] text-zinc-500 font-medium tracking-tight truncate">{vetProfile?.clinic_name || 'Clinic Office'}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        {vetProfile?.wilaya && (
                            <div className="flex items-center gap-2 text-zinc-500">
                                <MapPin size={14} className="text-zinc-300 shrink-0" />
                                <span className="text-[12px] font-medium truncate">{vetProfile.wilaya}, {vetProfile.commune}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-zinc-500">
                            <TrendingUp size={14} className="text-zinc-300 shrink-0" />
                            <span className="text-[12px] font-medium">{stats.reviewCount} total reviews</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shift Widget */}
            <div className="bg-zinc-900 rounded-xl p-5 text-white shadow-lg shadow-zinc-200/50">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Next Scheduled Appointment</span>
                </div>
                {recentAppointments.length > 0 ? (
                    <div>
                        <p className="text-xl font-semibold tracking-tight">{recentAppointments[0].scheduled_time}</p>
                        <p className="text-xs text-zinc-400 mt-1 font-medium italic">{recentAppointments[0].scheduled_date}</p>
                    </div>
                ) : (
                    <p className="text-sm font-medium text-zinc-400 italic">No upcoming shifts found.</p>
                )}
            </div>

            {/* Reviews Widget */}
            {recentReviews.length > 0 && (
                <div className="space-y-3">
                    <div className="px-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Feedback</span>
                    </div>
                    <div className="space-y-2">
                        {recentReviews.slice(0, 2).map((review, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-zinc-900">{review.utilisateurs?.full_name || 'Owner'}</span>
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                        <Star size={10} fill="currentColor" />
                                        <span className="text-[10px] font-bold text-zinc-900 ml-1">{review.owner_rating}</span>
                                    </div>
                                </div>
                                {review.owner_review && (
                                    <p className="text-[11px] text-zinc-500 italic line-clamp-2 leading-relaxed">"{review.owner_review}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}