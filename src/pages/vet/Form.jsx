import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Phone, LogIn, ArrowLeft, Send, 
  Loader2, ShieldCheck, Stethoscope, MapPin, Building2,
  ChevronRight, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VetRegistrationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    specialization: 'General Practice',
    clinicName: '',
    wilaya: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Creating your professional account...");
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message === 'User already registered') {
          throw new Error('An account with this email already exists.');
        }
        throw authError;
      }
      
      if (!authData.user) throw new Error("Registration failed.");

       const { error: vetAccountError } = await supabase.from('vet_accounts').insert([
         {
           id: authData.user.id,
           full_name: formData.fullName,
           email: formData.email,
           phone: formData.phone,
           license_number: formData.licenseNumber,
           specialization: formData.specialization,
           clinic_name: formData.clinicName,
           wilaya: formData.wilaya,
           status: 'active'
         }
       ]);

      if (vetAccountError) {
        if (vetAccountError.code === '42501') {
           throw new Error("Profile creation failed due to database security policies.");
        }
        throw vetAccountError;
      }
      
      toast.success("Welcome to the network, Dr. " + formData.fullName.split(' ')[0], { id: toastId });
      navigate('/vet/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Registration failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 font-sans antialiased selection:bg-emerald-100 flex flex-col relative overflow-x-hidden">
      
      {/* Vercel-style Dot Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" 
           style={{ backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
      />

      {/* Subtle Branding Navigation */}
      <nav className="relative z-10 px-8 h-[60px] flex items-center justify-between shrink-0 border-b border-zinc-100 bg-white/50 backdrop-blur-md">
        <Link to="/vet" className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <div className="size-7 rounded-md border border-zinc-200 flex items-center justify-center bg-white group-hover:border-zinc-300 shadow-sm transition-all">
            <ArrowLeft size={14} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Exit</span>
        </Link>
        
        <div className="flex items-center gap-2.5">
          <div className="size-7 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
             <img src="/logo.png" alt="" className="size-4 object-contain invert brightness-0" />
          </div>
          <span className="font-bold text-sm tracking-tightest">VetX</span>
        </div>

        <Link 
            to="/vet/login" 
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-tight flex items-center gap-1"
        >
            Login <ChevronRight size={14} />
        </Link>
      </nav>

      <main className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-10">
          
          {/* Form Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-2">
              <Sparkles size={12} /> Veterinarian Enrollment
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Join the professional network</h1>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">Complete your clinical profile to start managing appointments and patients instantly.</p>
          </div>

          {/* Registration Card */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Professional Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                      placeholder="Dr. Ahmed..."
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                      placeholder="name@clinic.dz"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input 
                      type="password" name="password" required value={formData.password} onChange={handleChange} minLength={6}
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Contact Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                        type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                        placeholder="05 / 06 / 07..."
                        />
                    </div>
                </div>

                {/* License Number */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">License No.</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                        type="text" name="licenseNumber" required value={formData.licenseNumber} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                        placeholder="VET-XXXX-DZ"
                        />
                    </div>
                </div>

                {/* Specialization */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Specialization</label>
                    <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                        <select 
                        name="specialization" value={formData.specialization} onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                        >
                        <option>General Practice</option>
                        <option>Surgery</option>
                        <option>Exotic Animals</option>
                        <option>Livestock</option>
                        </select>
                    </div>
                </div>

                {/* Clinic Name */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Establishment Name</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                        type="text" name="clinicName" required value={formData.clinicName} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                        placeholder="Clinic Office..."
                        />
                    </div>
                </div>

                {/* Wilaya */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Wilaya</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input 
                        type="text" name="wilaya" required value={formData.wilaya} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                        placeholder="e.g. Algiers"
                        />
                    </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 text-white py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-zinc-400" />
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-center text-xs text-zinc-500">
                  By joining, you agree to our{' '}
                  <button type="button" className="text-zinc-900 font-semibold hover:underline underline-offset-4">Terms of Service</button>.
              </p>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-zinc-500">
                Already part of the network?{' '}
                <Link to="/vet/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors underline underline-offset-4 decoration-emerald-200">
                    Log in to portal
                </Link>
            </p>
          </div>

        </div>
      </main>

      <footer className="relative z-10 px-8 py-8 flex items-center justify-center border-t border-zinc-100">
        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>Security</span>
          <span className="size-1 bg-zinc-200 rounded-full" />
          <span>Support</span>
          <span className="size-1 bg-zinc-200 rounded-full" />
          <span>Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}