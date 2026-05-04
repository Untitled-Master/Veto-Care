import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, ChevronRight, Heart, Activity, PawPrint, 
  Loader2, Filter, Weight, Info, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';

const petIcons = {
  Dog: Activity,
  Cat: Heart,
  Bird: Activity,
  Rabbit: PawPrint,
  Other: PawPrint,
};

function calculateAge(birthDate, ageMonths) {
  if (birthDate) {
    const date = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years}y`;
  }
  return ageMonths ? `${ageMonths} mo` : 'Age unknown';
}

export default function Pets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setError('Please log in to view your pets');

      const { data, error: fetchError } = await supabase
        .from(TABLES.PETS)
        .select('*')
        .eq('owner_id', user.id)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setPets(data || []);
    } catch (err) {
      setError('Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const speciesList = useMemo(() => {
    const species = ['All', ...new Set(pets.map(p => p.species))];
    return species;
  }, [pets]);

  const filteredPets = pets.filter(pet => {
    const matchesSearch = 
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.breed || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecies = selectedSpecies === 'All' || pet.species === selectedSpecies;
    return matchesSearch && matchesSpecies;
  });

  const action = (
    <Link to="/owner/pets/add" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-emerald-200/50 active:scale-95">
      <Plus size={14} /> Add New Pet
    </Link>
  );

  if (loading) {
    return (
      <OwnerLayout title="My Pets">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-sm text-zinc-500 font-medium animate-pulse">Syncing your pet records...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="My Pets" description={`${pets.length} active records`} action={action}>
      <div className="max-w-[1200px] mx-auto px-6 py-4 space-y-8 antialiased selection:bg-emerald-100">
        
        {/* Modern Search and Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50/50 p-4 rounded-xl border border-zinc-200">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-2 text-zinc-400 mr-1 border-r border-zinc-200 py-1">
              <SlidersHorizontal size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Species</span>
            </div>
            {speciesList.map((species) => (
              <button
                key={species}
                onClick={() => setSelectedSpecies(species)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${
                  selectedSpecies === species 
                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {species}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            <Info size={16} /> {error}
          </div>
        )}

        {/* Pets Grid */}
        {filteredPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPets.map((pet) => {
              const PetIcon = petIcons[pet.species] || Activity;
              const age = calculateAge(pet.birth_date, pet.age_months);
              
              return (
                <Link 
                  key={pet.id} 
                  to={`/owner/pets/${pet.id}`}
                  className="group relative flex flex-col bg-white rounded-xl border border-zinc-200 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-6">
                      <div className="size-16 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden group-hover:scale-105 transition-transform shadow-inner shrink-0">
                        {pet.image_url ? (
                          <img src={pet.image_url} alt={pet.name} className="size-full object-cover" />
                        ) : (
                          <PetIcon size={28} />
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        pet.status === 'Healthy' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {pet.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                        {pet.name}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 flex items-center gap-2">
                         {pet.breed || pet.species} 
                         <span className="size-1 bg-zinc-200 rounded-full" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Record #{pet.id.slice(0, 4)}</span>
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-zinc-50 flex items-center justify-between">
                      <div className="flex gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Age</span>
                          <span className="text-xs font-semibold text-zinc-900">{age}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Weight</span>
                          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-900">
                            {pet.weight_kg ? `${pet.weight_kg} kg` : '--'}
                          </div>
                        </div>
                      </div>
                      <div className="size-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                        <ChevronRight size={14} />
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
              <PawPrint size={32} className="text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
              {searchQuery ? 'No companions found' : 'Start your journey'}
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2 mb-8">
              {searchQuery 
                ? `No pet record matching "${searchQuery}" was found in our database.`
                : "It looks like you haven't added any pets yet. Register your first companion to track medical history."}
            </p>
            {!searchQuery ? (
              <Link 
                to="/owner/pets/add" 
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Plus size={16} /> Register Pet
              </Link>
            ) : (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}