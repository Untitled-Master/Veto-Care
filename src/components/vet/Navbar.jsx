import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, UserCircle } from 'lucide-react';

export default function VetNavbar({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-[#6B7280]"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-4">
          <Link 
            to="/vet/dashboard/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] hover:text-[#2BB673] hover:bg-[#F3F4F6] rounded-lg transition-all"
          >
            <UserCircle size={18} />
            <span className="hidden sm:inline font-medium">My Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
