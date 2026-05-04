import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCircle, 
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VetSidebar({ isOpen, onClose }) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/vet/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/vet/dashboard/appointments', icon: Calendar },
    { name: 'Public Profile', href: '/vet/dashboard/profile', icon: UserCircle },
  ];

  const handleSignOut = async () => {
    const toastId = toast.loading('Signing out...');
    await supabase.auth.signOut();
    toast.success('Signed out successfully', { id: toastId });
    window.location.href = '/vet/login';
  };

  return (
    <>
      {/* Mobile sidebar backdrop - Vercel style blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-zinc-200
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Sidebar header - Clean & Pro */}
          <div className="h-[60px] flex items-center justify-between px-6 border-b border-zinc-100 shrink-0">
            <Link to="/vet/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
              <div className="size-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
                <img src="/logo.png" alt="" className="size-5 brightness-0 invert object-contain" />
              </div>
              <span className="font-semibold tracking-tight text-zinc-900 text-sm">VetX Portal</span>
            </Link>
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Main Menu</span>
            </div>
            
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={isActive ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <div className="w-1 h-4 bg-emerald-600 rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-zinc-100 shrink-0">
            <button
              onClick={handleSignOut}
              className="group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-zinc-400 group-hover:text-red-500" />
                <span>Sign Out</span>
              </div>
            </button>
            
            {/* User Mini-Profile at bottom - Very "Dashboard" style */}
            <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-3 px-2">
              <div className="size-8 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                <UserCircle className="size-full text-zinc-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-900 truncate">Vet Account</span>
                <span className="text-[10px] text-zinc-400 truncate tracking-tight">Verified Professional</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}