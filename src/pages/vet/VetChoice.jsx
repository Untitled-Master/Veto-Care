import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LogIn, 
  UserPlus, 
  ArrowLeft, 
  Stethoscope, 
  ChevronRight, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function VetChoice() {
  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 font-sans antialiased selection:bg-emerald-100 flex flex-col relative overflow-hidden">
      
      {/* Vercel-style Dot Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" 
           style={{ backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
      />
      
      {/* Subtle Branding Top Bar */}
      <nav className="relative z-10 px-8 h-[60px] flex items-center justify-between shrink-0 border-b border-zinc-100 bg-white/50 backdrop-blur-md">
        <Link to="/" className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <div className="size-7 rounded-md border border-zinc-200 flex items-center justify-center bg-white group-hover:border-zinc-300 shadow-sm transition-all">
            <ArrowLeft size={14} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </Link>
        
        <div className="flex items-center gap-2.5">
          <div className="size-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
             <img src="/logo.png" alt="" className="size-4 object-contain invert brightness-0" />
          </div>
          <span className="font-bold text-sm tracking-tightest">VetX Professional</span>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </nav>

      {/* Main Gateway Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-[800px] w-full space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Stethoscope size={12} className="text-emerald-500" /> Professional Gateway
            </div>
            <h1 className="text-4xl font-semibold tracking-tightest text-zinc-900">Clinician Access</h1>
            <p className="text-zinc-500 text-sm max-w-md mx-auto font-medium">Select your entry point to manage your clinical presence on the VetX network.</p>
          </div>

          {/* Choice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Option 1: Login */}
            <Link 
              to="/vet/login"
              className="group relative flex flex-col p-8 bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="size-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-300">
                  <LogIn size={24} />
                </div>
                <ChevronRight size={18} className="text-zinc-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-emerald-600 transition-colors">Registered Practitioner</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  Access your dashboard, manage active appointments, and update clinical records.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                 <ShieldCheck size={14} className="text-emerald-500" /> Secure Clinical Access
              </div>
            </Link>

            {/* Option 2: Register */}
            <Link 
              to="/vet/register"
              className="group relative flex flex-col p-8 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden"
            >
              {/* Background Glow for Dark Card */}
              <div className="absolute -top-24 -right-24 size-48 bg-emerald-500/10 rounded-full blur-[60px]" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="size-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
                  <UserPlus size={24} />
                </div>
                <ChevronRight size={18} className="text-zinc-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="space-y-2 relative z-10">
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">Join the Network</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  Expand your clinic's digital reach. Verify your license and start onboarding patients today.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest relative z-10">
                 <Sparkles size={14} className="text-emerald-400" /> New Practice Onboarding
              </div>
            </Link>

          </div>

          {/* Footer Info */}
          <div className="text-center">
            <p className="text-xs text-zinc-400 font-medium italic">
              Verification requires a valid Algerian veterinary license number.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}