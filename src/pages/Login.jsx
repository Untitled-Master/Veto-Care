import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight, Phone, MapPin, ChevronDown } from 'lucide-react';
import { supabase, TABLES, USER_ROLES } from '../lib/supabase';
import algerianCities from './algeriancities.json';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const wilayas = useMemo(() => {
    const seen = new Set();
    const uniqueWilayas = [];
    for (const city of algerianCities) {
      const code = String(city.wilaya_code);
      if (!seen.has(code)) {
        seen.add(code);
        uniqueWilayas.push({
          code: code,
          name: city.wilaya_name_ascii,
          nameAr: city.wilaya_name
        });
      }
    }
    return uniqueWilayas.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const communes = useMemo(() => {
    if (!selectedWilaya) return [];
    return algerianCities
      .filter(city => String(city.wilaya_code) === selectedWilaya)
      .sort((a, b) => a.commune_name_ascii.localeCompare(b.commune_name_ascii));
  }, [selectedWilaya]);

  const handleWilayaChange = (e) => {
    setSelectedWilaya(e.target.value);
    setSelectedCommune('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        
        if (data.user) {
          // Verify user exists in utilisateurs table
          const { data: userData, error: userError } = await supabase
            .from(TABLES.UTILISATEURS)
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError && userError.code !== 'PGRST116') {
            throw userError;
          }

          if (!userData) {
            await supabase.auth.signOut();
            throw new Error('No account found. Please sign up first.');
          }

          navigate('/owner');
        }
      } else {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (!selectedWilaya || !selectedCommune) {
          setError('Please select wilaya and commune');
          setIsLoading(false);
          return;
        }

        const wilayaObj = wilayas.find(w => w.code === selectedWilaya);
        
        // Sign up with Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phoneNumber,
              wilaya_code: selectedWilaya,
              wilaya_name: wilayaObj?.name,
              commune: selectedCommune,
              role: USER_ROLES.CLIENT,
            }
          }
        });

        if (signUpError) throw signUpError;

        // Insert into utilisateurs table
        if (data.user) {
          const { error: insertError } = await supabase.from(TABLES.UTILISATEURS).insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            phone: phoneNumber,
            wilaya_code: selectedWilaya,
            wilaya_name: wilayaObj?.name,
            commune: selectedCommune,
            role: USER_ROLES.CLIENT,
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error('Insert error:', insertError);
          }
        }

        navigate('/owner');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans selection:bg-[#2BB673]/20 relative flex items-center justify-center">
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 mix-blend-multiply" />

      <div className="w-full max-w-md px-6 py-6 relative z-10 overflow-y-auto max-h-screen">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#2BB673] transition-colors mb-4">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <img src="/logo.png" alt="VetX" className="w-10 h-10 object-contain" />
          <span className="text-xl font-black tracking-tight text-[#111827]">VetX</span>
        </div>

        <h1 className="text-2xl font-medium tracking-tight mb-1 text-[#111827]">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm text-[#6B7280] mb-4">
          {isLogin ? 'Enter your credentials' : 'Join the network in Algeria'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex bg-[#E5E7EB] p-1 rounded-lg mb-4">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>Log In</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673]" 
                required
              />
              
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                <input 
                  type="tel" 
                  placeholder="Phone Number (e.g. 0551 23 45 67)" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673]" 
                  required
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                <select 
                  value={selectedWilaya}
                  onChange={handleWilayaChange}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673] appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Wilaya</option>
                  {wilayas.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" size={16} />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                <select 
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                  disabled={!selectedWilaya}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673] appearance-none cursor-pointer disabled:opacity-50"
                  required
                >
                  <option value="">Select Commune</option>
                  {communes.map(c => (
                    <option key={c.id} value={c.commune_name_ascii}>{c.commune_name_ascii}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" size={16} />
              </div>
            </>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673]" 
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673]" 
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#2BB673]" 
                required
              />
            </div>
          )}

          {isLogin && <div className="text-right"><a href="#" className="text-xs text-[#2D9CDB]">Forgot password?</a></div>}

          <button type="submit" disabled={isLoading} className="w-full bg-[#2BB673] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#27AE60] flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Sign In' : 'Create Account'}<ArrowRight size={14} /></>}
          </button>
        </form>

        <p className="text-center text-xs text-[#6B7280] mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#2BB673] font-medium">{isLogin ? 'Sign up' : 'Log in'}</button>
        </p>
      </div>
    </div>
  );
}