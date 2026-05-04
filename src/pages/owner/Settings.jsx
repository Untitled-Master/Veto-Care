import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, LogOut, Save, Loader2, Mail, Phone, Shield,
  ChevronRight, BadgeCheck, AlertCircle, KeyRound
} from 'lucide-react';
import { OwnerLayout } from '../../components/Owner/OwnerLayout';
import { supabase, TABLES } from '../../lib/supabase';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userAuth, setUserAuth] = useState(null);
  
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
  });

  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUserAuth(user);

      const { data, error } = await supabase
        .from(TABLES.UTILISATEURS)
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!userAuth) return;
    const toastId = toast.loading('Updating profile information...');

    try {
      setSaving(true);
      const { error } = await supabase
        .from(TABLES.UTILISATEURS)
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userAuth.id);

      if (error) throw error;
      toast.success('Settings updated successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to update profile', { id: toastId });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return toast.error('Passwords do not match');
    }
    if (passwords.new_password.length < 6) {
      return toast.error('Security requires at least 6 characters');
    }

    const toastId = toast.loading('Updating security credentials...');
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: passwords.new_password
      });

      if (error) throw error;
      
      toast.success('Password updated successfully', { id: toastId });
      setPasswords({ new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update credentials', { id: toastId });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      toast.error('Error signing out');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <OwnerLayout title="Settings">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="animate-spin text-emerald-600 size-8" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading preferences...</p>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout title="Account Settings">
      <div className="max-w-[800px] mx-auto px-6 py-10 antialiased selection:bg-emerald-100 space-y-10">
        
        {/* Profile Details Section */}
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={16} className="text-emerald-600" />
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Personal Information</h2>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded text-[9px] font-bold text-emerald-600 uppercase tracking-widest border border-emerald-100">
               <BadgeCheck size={10} /> Account Verified
            </div>
          </div>
          
          <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={14} className="text-zinc-300" />
                  </div>
                  <input 
                    type="text" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Registry</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={14} className="text-zinc-300" />
                  </div>
                  <input 
                    type="email" 
                    disabled
                    value={userAuth?.email || ''}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-100 bg-zinc-50/50 text-zinc-400 rounded-lg text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Contact Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={14} className="text-zinc-300" />
                  </div>
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-zinc-300"
                    placeholder="05 / 06 / 07..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Update Profile
              </button>
            </div>
          </form>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
            <KeyRound size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Security Credentials</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={14} className="text-zinc-300" />
                  </div>
                  <input 
                    type="password" 
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Confirm Update</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={14} className="text-zinc-300" />
                  </div>
                  <input 
                    type="password" 
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="Verify new password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={saving || !passwords.new_password}
                className="inline-flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                Change Password
              </button>
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50/30 rounded-xl border border-red-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-red-50/50">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2">
               <AlertCircle size={14} /> Session Management
            </h3>
            <p className="text-xs text-red-600 font-medium">Closing your clinical session will log you out of all active devices.</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <LogOut size={14} /> Terminate Session
          </button>
        </section>

      </div>
    </OwnerLayout>
  );
}