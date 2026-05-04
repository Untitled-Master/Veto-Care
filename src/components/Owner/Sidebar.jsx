import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Home, PawPrint, Calendar, FileText, Scissors, Settings, 
  ChevronRight, LogOut, Clock, X, ShieldCheck, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ownerPages = [
  { name: 'Dashboard', icon: Home, path: '/owner' },
  { name: 'My Pets', icon: PawPrint, path: '/owner/pets' },
  { name: 'Appointments', icon: Calendar, path: '/owner/appointments' },
  { name: 'Veterinarians', icon: Scissors, path: '/owner/vets' },
  { name: 'Settings', icon: Settings, path: '/owner/settings' },
];

const CACHE_KEY = 'vetx_user_data';

function getCachedUser() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
}

export function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const cached = getCachedUser();
  const [user, setUser] = useState(cached?.user || null);
  const [profile, setProfile] = useState(cached?.profile || null);
  const [loading, setLoading] = useState(!cached);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        const { data } = await supabase.from('utilisateurs').select('*').eq('id', authUser.id).single();
        if (data) {
          setProfile(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ user: authUser, profile: data, timestamp: Date.now() }));
        }
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem(CACHE_KEY);
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || (loading ? 'Loading...' : 'User');
  const avatarText = profile?.full_name 
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : user?.email ? user.email[0].toUpperCase() : '?';

  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Mobile overlay - Blur effect */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/10 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-zinc-200
        transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col h-full antialiased
      `}>
        
        {/* Header - SaaS Standard 60px height */}
        <div className="h-[60px] flex items-center justify-between px-6 border-b border-zinc-100 shrink-0">
          <Link to="/owner" className="flex items-center gap-2.5 transition-transform active:scale-95" onClick={() => setSidebarOpen(false)}>
            <div className="size-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
               <img src="/logo.png" alt="" className="size-5 object-contain invert brightness-0" />
            </div>
            <span className="font-bold text-sm tracking-tightest text-zinc-900">VetX</span>
          </Link>   
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/30">
          <div className="flex items-center gap-3 p-2 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className={`size-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${loading ? 'animate-pulse' : ''}`}>
              {avatarText}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate text-zinc-900 leading-none">{displayName}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Verified Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-4">
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Management</span>
          </div>
          
          {ownerPages.map((page) => {
            const isActive = location.pathname === page.path;
            return (
              <Link
                key={page.name}
                to={page.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <page.icon className={`size-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                  <span>{page.name}</span>
                </div>
                {isActive ? (
                   <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                ) : (
                   <ChevronRight size={12} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status Widget (Clock) */}
        <div className="px-6 mb-4">
           <div className="py-3 px-4 rounded-xl bg-zinc-900 text-white shadow-lg shadow-zinc-200">
              <div className="flex items-center gap-2 mb-1">
                 <Clock size={12} className="text-emerald-400" />
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Local Time</span>
              </div>
              <div className="text-lg font-semibold tracking-tight">{formattedTime}</div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 shrink-0">
          <button 
            onClick={handleSignOut} 
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="size-4 text-zinc-400 group-hover:text-red-500" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}