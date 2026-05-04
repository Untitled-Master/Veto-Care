import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowLeft, 
  LogIn, 
  Loader2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VetLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Authentication failed. No user returned.');
      }

      const { data: vetData, error: vetError } = await supabase
        .from('vet_accounts')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (vetError && vetError.code !== 'PGRST116') {
         throw vetError;
      }

      if (!vetData) {
        await supabase.auth.signOut();
        throw new Error('No veterinarian profile found for this account.');
      }

      if (vetData.status === 'suspended') {
        await supabase.auth.signOut();
        throw new Error('This account has been suspended.');
      }

      toast.success('Welcome back, Dr. ' + (vetData.full_name?.split(' ')[0] || ''));
      navigate('/vet/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 font-sans antialiased selection:bg-emerald-100 flex flex-col relative overflow-hidden">
      
      {/* Vercel-style Dot Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" 
           style={{ backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
      />
      
      {/* Subtle Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-60" />

      {/* Navigation */}
      <nav className="relative z-10 px-8 h-[60px] flex items-center justify-between shrink-0 border-b border-zinc-100 bg-white/50 backdrop-blur-md">
        <Link to="/vet" className="flex items-center gap-2 group text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-semibold uppercase tracking-tight">EXIT</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="size-6 bg-emerald-600 rounded-md flex items-center justify-center shadow-sm">
             <img src="/logo.png" alt="" className="size-4 object-contain invert brightness-0" />
          </div>
          <span className="font-bold text-sm tracking-tightest">VetX</span>
        </div>

        <Link to="/vet/register" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-tight">
          Register
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        <div className="max-w-[400px] w-full space-y-8">
          
          {/* Brand/Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center size-12 rounded-xl bg-zinc-50 border border-zinc-200 text-emerald-600 mb-4 shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
            <p className="text-zinc-500 text-sm">Sign in to your clinical dashboard</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                    placeholder="doctor@vetx.dz"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <Link to="/vet/forgot-password" size="sm" className="text-xs font-medium text-zinc-500 hover:text-emerald-600 transition-colors">
                  Forgot your password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-zinc-900 text-white py-2.5 rounded-lg font-semibold hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-zinc-400" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-zinc-500">
            Don't have an account?{' '}
            <Link to="/vet/register" className="font-semibold text-zinc-900 hover:text-emerald-600 underline underline-offset-4 transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}