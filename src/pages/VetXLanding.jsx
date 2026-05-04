import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Search, MapPin, Stethoscope, ShieldCheck, 
  Globe, ChevronRight, Menu, X, User, Star, TrendingUp, 
  Clock, Zap, Quote, CalendarCheck, Facebook, Twitter, 
  Linkedin, Instagram, Mail, Sparkles, MoveRight, CheckCircle2,
  Activity, BarChart3, Database
} from 'lucide-react';
import AlgeriaMap from '../components/AlgeriaMap';

export default function VetXLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); 
  
  const featuresRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!spotlightRef.current) return;
      const rect = spotlightRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight * 0.8), 0), 1);
      setScrollProgress(progress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.animate-on-scroll').forEach((el) => {
              el.style.animationPlayState = 'running';
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (spotlightRef.current) observer.observe(spotlightRef.current);

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-on-scroll { opacity: 0; animation: fadeInUp 0.4s ease-out forwards; animation-play-state: paused; }
        .custom-scrollbar::-webkit-scrollbar { height: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* Structured Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]" 
           style={{ backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
      />
      
      {/* Navigation - Compact 56px */}
      <nav className="fixed top-0 w-full z-[120] bg-white/80 backdrop-blur-md border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 h-[56px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
              <div className="size-6 bg-emerald-600 rounded-md flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="" className="size-4 object-contain invert brightness-0" />
              </div>
              <span className="font-bold text-sm tracking-tightest">VetX</span>
            </Link>
            <div className="hidden md:flex items-center gap-5 text-[12px] font-semibold text-zinc-500">
              <a href="#map" className="hover:text-emerald-600 transition-colors">Wilayas</a>
              <a href="#stats" className="hover:text-emerald-600 transition-colors">Data</a>
              <a href="#feedback" className="hover:text-emerald-600 transition-colors">Community</a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <Link to="/vet" className="text-[12px] font-bold text-zinc-500 hover:text-zinc-900 px-3 py-1.5 transition-colors">Vets</Link>
            <div className="h-4 w-px bg-zinc-200 mx-1" />
            <Link to="/login" className="text-[12px] font-bold text-zinc-900 px-3 py-1.5 hover:bg-zinc-50 rounded-md">Log in</Link>
          </div>

          <button className="md:hidden p-2 text-zinc-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <main className="pt-[56px]">
        
        {/* Compact Hero Section */}
        <section className="max-w-7xl mx-auto px-4 pt-16 pb-12 relative border-b border-zinc-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest animate-on-scroll">
                <Sparkles size={12} /> Distributed clinical infrastructure
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tightest leading-[1.1] text-zinc-900">
                Unified health records for <span className="text-emerald-600">Algerian clinics.</span>
              </h1>
              <p className="text-sm md:text-base text-zinc-500 font-medium max-w-lg leading-relaxed">
                Aggregating paper-based medical histories into a secure, mobile cloud. 
                Providing 1,200+ veterinarians with digital intelligence and verified pet owner access.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/login" className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 group shadow-lg">
                  Book Clinic <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/vet" className="border border-zinc-200 bg-white text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-all shadow-sm">
                  Vet Portal
                </Link>
              </div>
              
              <div className="flex items-center gap-6 pt-8 border-t border-zinc-100">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="size-6 rounded-full border-2 border-white bg-zinc-100" />)}
                 </div>
                 <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight">Trusted by leading regional networks</p>
              </div>
            </div>

            <div className="hidden lg:block relative">
  <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-2 shadow-inner aspect-square w-full max-w-[440px] ml-auto">
    <div className="bg-white rounded-lg border border-zinc-200 h-full w-full relative overflow-hidden">
      <img
        src="https://i.pinimg.com/736x/da/e7/d6/dae7d6ab8e2abd3e74d776a5fd49a6cb.jpg"
        alt="Clinical Dashboard Preview"
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  </div>
</div>
          </div>
        </section>

        {/* Dynamic Spotlight Section - Tightened */}
        <section  
          className="relative w-full flex justify-center py-12 overflow-hidden z-[110] bg-zinc-50/50"
        >
          <div 
            style={{ 
              width: `${94 + (scrollProgress * 6)}%`,
              height: `${60 + (scrollProgress * 20)}vh`,
              borderRadius: `${1.5 * (1 - scrollProgress)}rem`,
              transform: `scale(${0.99 + (scrollProgress * 0.01)})`,
            }}
            className="relative overflow-hidden group cursor-pointer bg-zinc-900 shadow-2xl transition-all duration-300 ease-out border border-zinc-800"
          >
            <img src="https://i.pinimg.com/1200x/20/10/b7/2010b7bcf26f2afef9ef83690e257dcb.jpg" alt="" className="size-full object-cover " />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500">Infrastructure</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-semibold mb-4 max-w-2xl tracking-tightest leading-tight">Securing the health history of a nation.</h2>
              <a href="/login">
                <button className="group/btn inline-flex items-center gap-2 bg-white text-zinc-900 px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-all w-fit uppercase tracking-widest">
                  Start Registry <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>
          </div>
          <span ref={spotlightRef}></span>
        </section>

        {/* Data Grid Section */}
        <section id="stats" className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Performance</span>
              <h3 className="text-3xl font-semibold tracking-tightest leading-none">Built for scale.</h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">Optimization metrics from Algiers' top tier veterinary clinics.</p>
              <div className="pt-4 flex flex-col gap-3">
                 <div className="flex justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Growth</span>
                    <span className="text-xs font-bold text-emerald-600">+42%</span>
                 </div>
                 <div className="flex justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Retention</span>
                    <span className="text-xs font-bold text-emerald-600">98%</span>
                 </div>
              </div>
            </div>

            {[
              { title: 'Clinical Intelligence', icon: BarChart3, val: '12h', desc: 'Saved per vet weekly.' },
              { title: 'Verified Network', icon: ShieldCheck, val: '58', desc: 'Wilayas active in DZ.' }
            ].map((card, i) => (
              <div key={i} className="p-8 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-emerald-500/30 transition-all">
                <card.icon className="size-6 text-zinc-900 mb-6" />
                <div className="text-3xl font-bold tracking-tightest mb-1">{card.val}</div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">{card.title}</h4>
                <p className="text-xs text-zinc-500 mt-2 font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Map Section - Integrated & Compact */}
        <section id="map" className="border-y border-zinc-100 bg-zinc-50/40">
           <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 items-center">
              <div className="py-16 md:py-24 space-y-6">
                 <div className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 py-0.5 bg-zinc-100 rounded border border-zinc-200">
                    <Globe size={12} /> Regional Operations
                 </div>
                 <h2 className="text-4xl font-semibold tracking-tightest text-zinc-900">Algeria's digital health frontier.</h2>
                 <p className="text-sm text-zinc-500 font-medium max-w-sm leading-relaxed">We are aggressively onboarding clinics in rural and urban areas to bridge the veterinary healthcare gap.</p>
                 
                 <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="space-y-1 border-l border-emerald-500 pl-4">
                       <div className="text-xl font-bold">1,200+</div>
                       <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Verified Clinicians</div>
                    </div>
                    <div className="space-y-1 border-l border-zinc-200 pl-4">
                       <div className="text-xl font-bold">58/58</div>
                       <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Regional Coverage</div>
                    </div>
                 </div>
              </div>
              <div className="relative h-[400px] flex items-center justify-center p-8 [&_svg]:w-full [&_svg]:h-full [&_path]:fill-zinc-200 [&_path]:stroke-white hover:[&_path]:fill-emerald-600 transition-all">
                 <AlgeriaMap />
                 <div className="absolute top-1/4 right-1/4 size-2 bg-emerald-500 rounded-full animate-ping" />
              </div>
           </div>
        </section>

        {/* Community Marquee - Smaller & Faster */}
        <section id="feedback" className="py-16 bg-white overflow-hidden">
          <div className="relative w-full flex">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex w-max animate-marquee space-x-4">
              {[1, 2].map((loop) => (
                <React.Fragment key={loop}>
                  {[
                    { text: 'Digital records saved a patient last week. Immediate access is vital.', user: 'Dr. Amina K.', role: 'Algiers' },
                    { text: 'Booking a vaccination takes 2 minutes now. Incredibly professional.', user: 'Sofiane B.', role: 'Oran' },
                    { text: 'The dashboard handles our 40+ daily clients perfectly.', user: 'Dr. Yassine M.', role: 'Annaba' }
                  ].map((card, i) => (
                    <div key={i} className="w-[300px] bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                      <p className="text-xs font-semibold text-zinc-700 leading-relaxed italic mb-6">"{card.text}"</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-zinc-50">
                        <div className="size-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold border border-zinc-200">{card.user[4]}</div>
                        <div>
                          <p className="text-[11px] font-bold text-zinc-900 leading-none">{card.user}</p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight mt-1">{card.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Matrix - Compact Icons */}
        <section ref={featuresRef} className="max-w-7xl mx-auto px-4 py-20">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { t: 'Interpretable Records', d: 'Global health mobility.', i: Database },
                { t: 'Verification', d: 'Checked clinical licenses.', i: ShieldCheck },
                { t: 'Steerable Search', d: 'Wilaya-based filtering.', i: Search },
                { t: 'Automation', d: 'SMS appointment reminders.', i: Zap }
              ].map((f, i) => (
                <div key={i} className="p-5 border border-zinc-100 rounded-xl hover:bg-zinc-50/50 transition-all animate-on-scroll">
                   <f.i className="size-5 text-emerald-600 mb-4" strokeWidth={2} />
                   <h4 className="text-[13px] font-bold text-zinc-900 tracking-tight">{f.t}</h4>
                   <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-tight">{f.d}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      {/* Footer - Compact & Professional */}
      <footer className="bg-zinc-50 pt-16 pb-8 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-12 pb-16">
            <div className="md:col-span-4 space-y-4">
               <span className="font-bold text-sm tracking-tightest">VetX</span>
               <p className="text-xs text-zinc-500 font-medium max-w-xs leading-relaxed"> Frontier digital infrastructure for Algerian veterinary clinics and pet owners.</p>
            </div>
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
               <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Network</h5>
                  <ul className="text-[12px] text-zinc-500 space-y-2 font-medium">
                     <li className="hover:text-emerald-600 cursor-pointer">Find Clinic</li>
                     <li className="hover:text-emerald-600 cursor-pointer">Vet Portal</li>
                  </ul>
               </div>
               <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Connect</h5>
                  <div className="flex gap-3 text-zinc-400">
                    <Twitter size={16} className="hover:text-zinc-900" />
                    <Linkedin size={16} className="hover:text-zinc-900" />
                  </div>
               </div>
               <div className="col-span-2 sm:col-span-1 space-y-3">
                  <h5 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Legal</h5>
                  <p className="text-[11px] text-zinc-400 font-medium tracking-tight">© 2024 VetX Algeria PBC.</p>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}