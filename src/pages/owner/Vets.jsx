import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ChevronRight, Loader2, MapPin, Star, 
  Clock, Award, Phone, Filter, X, ShieldCheck, 
  CheckCircle2, Globe , Stethoscope
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';

const wilayas = [
  'Alger', 'Oran', 'Constantine', 'Blida', 'Annaba', 'Setif', 'Batna', 
  'Mostaganem', 'Biskra', 'Tiaret', 'Tlemcen', 'Bejaia'
];

const specialtiesList = [
  'Surgery', 'Orthopedics', 'Dentistry', 'Cardiology', 'Internal Medicine',
  'Exotic Animals', 'Preventive Care', 'Nutrition'
];

// Reusable Star Component
function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            size={14} 
            className={`${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-[#202124]">{rating}</span>
      {count > 0 && <span className="text-xs text-[#9CA3AF]">({count})</span>}
    </div>
  );
}

// Helper to get today's working hours and open status
function getTodayHours(hours) {
  if (!hours) return { hours: null, isOpen: false };
  try {
    const parsed = typeof hours === 'string' ? JSON.parse(hours) : hours;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayHours = parsed[today];
    
    if (!todayHours || todayHours.toLowerCase() === 'closed') {
      return { hours: 'Closed', isOpen: false };
    }
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openTime, closeTime] = todayHours.split('-');
    const [openHour, openMin] = openTime.trim().split(':').map(Number);
    const [closeHour, closeMin] = closeTime.trim().split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    
    return { hours: todayHours, isOpen };
  } catch {
    return { hours: null, isOpen: false };
  }
}

export default function Vets() {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [selectedWilayas, setSelectedWilayas] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from(TABLES.VETS)
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (fetchError) throw fetchError;
      setVets(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (item, current, setCurrent) => {
    if (current.includes(item)) {
      setCurrent(current.filter(i => i !== item));
    } else {
      setCurrent([...current, item]);
    }
  };

  const filteredVets = useMemo(() => {
    return vets.filter(vet => {
      const matchesSearch = !searchQuery || 
        vet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.wilaya?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesWilaya = selectedWilayas.length === 0 || selectedWilayas.includes(vet.wilaya);
      
      const vetSpecialties = Array.isArray(vet.specialties) ? vet.specialties : JSON.parse(vet.specialties || '[]');
      const matchesSpecialties = selectedSpecialties.length === 0 || selectedSpecialties.some(spec => 
        vetSpecialties.includes(spec)
      );

      return matchesSearch && matchesWilaya && matchesSpecialties;
    });
  }, [vets, searchQuery, selectedWilayas, selectedSpecialties]);

  const activeFiltersCount = selectedWilayas.length + selectedSpecialties.length;

  const action = (
    <button 
      onClick={() => setShowFilters(!showFilters)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
        showFilters || activeFiltersCount > 0
          ? 'bg-[#2BB673] text-white border-[#2BB673]' 
          : 'bg-white text-[#5F6368] border-[#E5E7EB] hover:border-[#2BB673]'
      }`}
    >
      <Filter size={18} /> 
      Filters
      {activeFiltersCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 bg-white text-[#2BB673] text-[10px] rounded-full">
          {activeFiltersCount}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <OwnerLayout title="Find a Vet">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 size={32} className="animate-spin text-[#2BB673]" />
          <p className="text-[#5F6368] font-medium animate-pulse">Consulting our directory...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout 
      title="Find a Vet" 
      description={`${filteredVets.length} qualified specialists near you`}
      action={action}
    >
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Modern Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#2BB673] transition-colors" />
            <input
              type="text"
              placeholder="Search by name, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#2BB673]/10 focus:border-[#2BB673] transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#202124]">Filter Results</h3>
              <button onClick={() => {setSelectedWilayas([]); setSelectedSpecialties([]);}} className="text-xs font-bold text-[#2BB673] hover:underline">Reset All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-3 block">Wilaya / Location</label>
                <div className="flex flex-wrap gap-2">
                  {wilayas.map(w => (
                    <button
                      key={w}
                      onClick={() => toggleFilter(w, selectedWilayas, setSelectedWilayas)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedWilayas.includes(w) ? 'bg-[#2BB673] text-white border-[#2BB673]' : 'bg-white text-[#5F6368] border-[#E5E7EB] hover:border-[#2BB673]'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-3 block">Specialty</label>
                <div className="flex flex-wrap gap-2">
                  {specialtiesList.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleFilter(s, selectedSpecialties, setSelectedSpecialties)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedSpecialties.includes(s) ? 'bg-[#2D9CDB] text-white border-[#2D9CDB]' : 'bg-white text-[#5F6368] border-[#E5E7EB] hover:border-[#2D9CDB]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vets Grid */}
        {filteredVets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVets.map((vet) => {
              const { hours: todayHours, isOpen } = getTodayHours(vet.working_hours);
              const vetSpecialties = Array.isArray(vet.specialties) ? vet.specialties : JSON.parse(vet.specialties || '[]');
              
              return (
                <Link 
                  key={vet.id} 
                  to={`/owner/vets/${vet.id}`}
                  className="group relative flex flex-col bg-white rounded-[24px] border border-[#E5E7EB] p-6 hover:border-[#2BB673] hover:shadow-2xl hover:shadow-[#2BB673]/10 transition-all duration-300"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {vet.profile_pic_url ? (
                          <img src={vet.profile_pic_url} alt={vet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#E8F5E9] text-[#2BB673] text-2xl font-black">
                            {vet.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F5E9] text-[#00897B] text-[10px] font-black uppercase tracking-tighter rounded-lg">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-1 mb-4">
                    <h3 className="text-xl font-bold text-[#202124] group-hover:text-[#2BB673] transition-colors">{vet.name}</h3>
                    <div className="flex items-center gap-1 text-sm font-medium text-[#5F6368]">
                      <MapPin size={14} className="text-[#9CA3AF]" />
                      {vet.commune}, {vet.wilaya}
                    </div>
                  </div>

                  <StarRating rating={vet.rating} count={vet.review_count} />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F3F4]">
                      <div className="text-[10px] font-black uppercase text-[#9CA3AF] mb-1">Experience</div>
                      <div className="text-sm font-bold text-[#202124] flex items-center gap-1.5">
                        <Award size={14} className="text-[#2BB673]" /> {vet.experience_years} Years
                      </div>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F3F4]">
                      <div className="text-[10px] font-black uppercase text-[#9CA3AF] mb-1">{isOpen ? 'Open Now' : 'Status'}</div>
                      <div className="text-sm font-bold flex items-center gap-1.5 line-clamp-1">
                        <Clock size={14} className={isOpen ? 'text-[#2BB673]' : 'text-[#EF4444]'} />
                        <span className={isOpen ? 'text-[#2BB673]' : 'text-[#EF4444]'}>
                          {todayHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mt-6 space-y-2 flex-1">
                    <div className="text-[10px] font-black uppercase text-[#9CA3AF] tracking-widest">Top Specialties</div>
                    <div className="flex flex-wrap gap-1.5">
                      {vetSpecialties.slice(0, 3).map((spec, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-[#E5E7EB] text-[#5F6368] text-[11px] font-bold rounded-lg transition-colors group-hover:border-[#2BB673]/30">
                          {spec}
                        </span>
                      ))}
                      {vetSpecialties.length > 3 && (
                        <span className="text-[11px] font-bold text-[#9CA3AF] pt-1">+{vetSpecialties.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-8 pt-4 border-t border-[#F1F3F4] flex items-center justify-between">
                    <div className="text-sm font-bold text-[#2BB673] flex items-center gap-1">
                      View Profile <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#F8FAFC] rounded-lg text-[#5F6368] hover:bg-[#E8F5E9] hover:text-[#2BB673] transition-colors">
                        <Phone size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-[#E5E7EB] rounded-[32px] shadow-sm">
            <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
              <Stethoscope size={40} className="text-[#D1D5DB]" />
            </div>
            <h3 className="text-xl font-bold text-[#202124]">No specialists found</h3>
            <p className="text-sm text-[#5F6368] max-w-xs mx-auto mt-2 mb-8">
              We couldn't find any veterinarians matching your current filters.
            </p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedWilayas([]); setSelectedSpecialties([]);}}
              className="px-6 py-3 bg-[#E8F5E9] text-[#2BB673] font-bold rounded-xl hover:bg-[#2BB673] hover:text-white transition-all shadow-sm shadow-[#2BB673]/10"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}