import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Dog,
  HeartPulse,
  MessageCircleHeart,
  MapPinned,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TimerReset,
  UserRoundCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const features = [
  {
    title: 'Verified vets',
    description: 'Every veterinarian profile is reviewed so pet owners can book with confidence.',
    icon: UserRoundCheck
  },
  {
    title: 'Smart scheduling',
    description: 'Find open slots quickly with clear availability and instant appointment confirmation.',
    icon: CalendarCheck2
  },
  {
    title: 'Secure health records',
    description: 'Medical files and notes are stored safely for smooth follow-up visits.',
    icon: ShieldCheck
  }
]

const topClinics = [
  { name: 'Happy Paws Clinic', city: 'Tunis', rating: '4.9', x: '42%', y: '30%' },
  { name: 'Blue Coast Vet', city: 'Sousse', rating: '4.8', x: '56%', y: '48%' },
  { name: 'Palm Care Vet', city: 'Sfax', rating: '4.7', x: '64%', y: '70%' }
]

function LandingPage() {
  return (
    <PageLayout>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
            <HeartPulse className="h-3.5 w-3.5" />
            End-to-end care for pets and owners
          </p>
          <h1 className="font-title text-4xl font-semibold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
            Better veterinary care starts with a smarter digital clinic.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
            Book trusted vets, track appointments, and manage pet records in one clean platform built for speed and reliability.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-medium text-emerald-50 transition hover:bg-emerald-900"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/25 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-emerald-50"
            >
              Sign in
            </Link>
          </div>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <p className="text-3xl font-semibold text-slate-900">2k+</p>
              <p className="text-xs text-slate-500">Monthly bookings</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <p className="text-3xl font-semibold text-slate-900">150+</p>
              <p className="text-xs text-slate-500">Verified veterinarians</p>
            </div>
            <div className="rounded-2xl border border-emerald-900/10 bg-white p-5">
              <p className="text-3xl font-semibold text-slate-900">98%</p>
              <p className="text-xs text-slate-500">Owner satisfaction</p>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_20px_80px_-20px_rgba(17,94,89,0.4)]">
          <div className="pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full bg-amber-200/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl" />
          <div className="relative space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Today highlights</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700"><Stethoscope className="h-4 w-4 text-emerald-700" /> Dr. Salma</span>
                  <span className="text-xs font-medium text-emerald-700">09:30</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-700"><Syringe className="h-4 w-4 text-cyan-700" /> Vaccination</span>
                  <span className="text-xs font-medium text-cyan-700">11:00</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <MapPinned className="h-4 w-4 text-emerald-700" />
                Nearby clinics map
              </div>
              <div className="relative h-48 rounded-xl bg-[linear-gradient(120deg,#e8f7f0,#edf7ff)]">
                <svg className="h-full w-full" viewBox="0 0 400 220" role="img" aria-label="Clinic map illustration">
                  <path d="M12,190 C80,130 120,170 190,128 C230,104 280,120 340,78" stroke="#6bb39e" strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M40,54 C100,40 170,46 242,28 C290,18 336,40 370,16" stroke="#8db9de" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
                </svg>
                {topClinics.map((clinic) => (
                  <div
                    key={clinic.name}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: clinic.x, top: clinic.y }}
                  >
                    <div className="group relative flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg">
                      <MapPinned className="h-3 w-3" />
                      <div className="pointer-events-none absolute bottom-7 left-1/2 hidden w-40 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-xl group-hover:block">
                        <p className="font-medium text-slate-800">{clinic.name}</p>
                        <p className="text-slate-500">{clinic.city}</p>
                        <p className="text-amber-600">{clinic.rating} / 5</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon
          return (
            <article
              key={feature.title}
              className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.2)] transition hover:-translate-y-1"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-title text-lg font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </article>
          )
        })}
      </section>

      <section className="mt-14 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white">
          <img
            src="https://www.petvetcarecenters.com/files/pv-corperate-home-main.png"
            alt="PetVet care center team"
            className="h-72 w-full object-cover md:h-80"
          />
          <div className="p-6 md:p-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Trusted care network
            </p>
            <h2 className="mt-3 font-title text-2xl font-semibold text-slate-900">Modern clinics, compassionate teams</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
              Veto-Care connects owners with partner facilities focused on quality diagnostics, preventive medicine, and personalized treatment plans.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Fast onboarding</p>
              <p className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800"><TimerReset className="h-4 w-4" /> Shorter waiting time</p>
              <p className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm text-cyan-800"><MessageCircleHeart className="h-4 w-4" /> Continuous follow-up</p>
              <p className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-800"><Dog className="h-4 w-4" /> All pet types welcome</p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-900/10 bg-white p-6 md:p-7">
          <h2 className="font-title text-2xl font-semibold text-slate-900">Why owners choose Veto-Care</h2>
          <p className="mt-2 text-sm text-slate-600 md:text-base">
            A practical platform built for real veterinary workflows, from first booking to post-visit follow-up.
          </p>
          <div className="mt-5 space-y-3">
            {[
              'Dedicated route structure for auth, vets, appointments, and uploads.',
              'Secure access with token-based middleware and role-ready backend architecture.',
              'Simple user journey from registration to medical records management.',
              'Scalable setup for docs, analytics, and production readiness.'
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                <p className="inline-flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-900"><PhoneCall className="h-4 w-4" /> Need guided onboarding for your clinic?</p>
            <p className="mt-1 text-sm text-emerald-800">Our team can help you import existing patient records and go live faster.</p>
          </div>
        </article>
      </section>
    </PageLayout>
  )
}

export default LandingPage
