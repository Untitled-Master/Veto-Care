import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCircle, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VetLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const toastId = toast.loading('Signing out...');
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully', { id: toastId });
      navigate('/vet/login');
    } catch (error) {
      toast.error('Error signing out', { id: toastId });
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/vet/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/vet/dashboard/appointments', icon: Calendar },
    { name: 'Public Profile', href: '/vet/dashboard/profile', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-zinc-900">
      {/* Mobile sidebar backdrop - Professional Blur */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/10 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-zinc-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section - SaaS Style */}
          <div className="h-[60px] flex items-center px-6 border-b border-zinc-100 shrink-0">
            <Link to="/vet/dashboard" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
              <div className="size-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
                <img src="/logo.png" alt="VetX" className="size-5 object-contain invert brightness-0" />
              </div>
              <span className="font-semibold text-zinc-900 tracking-tightest">VetX Portal</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="px-3 mb-4 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Management</span>
            </div>

            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/vet/dashboard' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
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
                    <item.icon className={`size-4 transition-colors ${isActive ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <div className="w-1 h-4 bg-emerald-600 rounded-full" />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-100 space-y-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200 group"
            >
              <LogOut className="size-4 text-zinc-400 group-hover:text-red-500" />
              <span>Sign Out</span>
            </button>

            {/* Bottom Profile Badge */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100">
              <div className="size-7 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                <UserCircle className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-900 truncate leading-none">Vet Account</span>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className="size-2.5 text-emerald-500" />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header - Exact 60px height to match sidebar header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-30 h-[60px]">
          <div className="flex items-center justify-between px-8 h-full">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <Link 
                to="/vet/dashboard/profile" 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200"
              >
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-xs font-semibold text-zinc-900 leading-none">Settings</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">Profile & Security</span>
                </div>
                <div className="size-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 group">
                  <UserCircle className="size-5 group-hover:text-emerald-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="max-w-[1200px] mx-auto p-6 md:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}