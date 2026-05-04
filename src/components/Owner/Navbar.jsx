import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, Search, Calendar, Plus, Bell, Command, ChevronRight 
} from 'lucide-react';

export function Navbar({ sidebarOpen, setSidebarOpen, title, description, action }) {
  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-zinc-100 px-6 md:px-8 flex items-center justify-between h-[60px] antialiased">
      
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Platform</span>
            <ChevronRight size={10} className="hidden md:block text-zinc-300" />
            <h1 className="text-sm font-semibold text-zinc-900 tracking-tight leading-none">
              {title}
            </h1>
          </div>
          {description && (
            <p className="hidden sm:block text-[11px] font-medium text-zinc-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        

        {/* Global Action Prop (e.g. "Add Pet") */}
        {action && <div className="hidden sm:block">{action}</div>}

        {/* Quick Nav Group */}
        <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-lg border border-zinc-100 shadow-inner">
          <Link 
            to="/owner/appointments" 
            title="Calendar"
            className="p-1.5 text-zinc-500 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
          >
            <Calendar size={16} />
          </Link>
          
          <Link 
            to="/owner/pets/add" 
            title="Register Pet"
            className="p-1.5 text-zinc-500 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
          >
            <Plus size={16} />
          </Link>
        </div>

        {/* Notifications */}
        <button 
          title="Notifications"
          className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-all"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 size-2 bg-emerald-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
}