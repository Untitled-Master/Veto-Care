import {
  Activity,
  CalendarClock,
  FileText,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRound
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import PageLayout from '../components/PageLayout'
import { apiRequest } from '../lib/api'
import { getRole, getUser, getVetProfile } from '../lib/auth'

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vets, setVets] = useState([])
  const [appointments, setAppointments] = useState([])

  const user = getUser()
  const role = getRole()
  const vetProfile = getVetProfile()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')

      try {
        const [vetsData, appointmentsData] = await Promise.all([
          apiRequest('/vets'),
          apiRequest(role === 'vet' ? '/appointments?role=vet' : '/appointments')
        ])

        setVets(Array.isArray(vetsData) ? vetsData : [])
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [role])

  const metrics = useMemo(() => {
    const filesCount = appointments.filter((item) => Boolean(item.health_record_path)).length

    return [
      {
        label: role === 'vet' ? 'Appointments to manage' : 'Upcoming appointments',
        value: String(appointments.length).padStart(2, '0'),
        icon: CalendarClock,
        tone: 'bg-emerald-50 text-emerald-800'
      },
      {
        label: 'Health files linked',
        value: String(filesCount).padStart(2, '0'),
        icon: FileText,
        tone: 'bg-cyan-50 text-cyan-800'
      },
      {
        label: 'Available vets',
        value: String(vets.length).padStart(2, '0'),
        icon: ShieldCheck,
        tone: 'bg-amber-50 text-amber-800'
      }
    ]
  }, [appointments, vets, role])

  return (
    <PageLayout>
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Welcome back, {user?.email || 'Pet owner'}</p>
          <h1 className="font-title text-4xl font-semibold text-slate-900 md:text-5xl">
            {role === 'vet' ? 'Veterinarian Dashboard' : 'Your care dashboard'}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Live operational data from your backend to track appointments, records, and clinic activity.
          </p>
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </div>
      </section>

      {role === 'vet' && vetProfile ? (
        <section className="mb-6 rounded-2xl border border-emerald-900/10 bg-white p-6">
          <p className="inline-flex items-center gap-2 text-sm text-emerald-700">
            <Stethoscope className="h-4 w-4" />
            Vet account profile
          </p>
          <h2 className="mt-2 font-title text-2xl text-slate-900">{vetProfile.name}</h2>
          <p className="text-sm text-slate-600">{vetProfile.specialization || 'General medicine'} • {vetProfile.email}</p>
        </section>
      ) : null}

      <section className="mb-6 grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <article key={metric.label} className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-[0_18px_50px_-24px_rgba(17,94,89,0.4)]">
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${metric.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{loading ? '--' : metric.value}</p>
              <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
            </article>
          )
        })}
      </section>

      <section className="mb-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-emerald-900/10 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-title text-xl font-semibold text-slate-900">Live appointments</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
              <Activity className="h-3.5 w-3.5" />
              {loading ? 'Loading' : `${appointments.length} records`}
            </span>
          </div>

          {loading ? <p className="text-sm text-slate-500">Loading appointments...</p> : null}

          {!loading && appointments.length === 0 ? (
            <p className="text-sm text-slate-500">No appointments found yet.</p>
          ) : null}

          <div className="space-y-3">
            {appointments.map((item, index) => (
              <div key={item.id || index} className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="inline-flex items-center gap-2 font-medium text-slate-900">
                    <UserRound className="h-4 w-4 text-emerald-700" />
                    {item.animal_name || `Pet ${index + 1}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.date_rdv ? new Date(item.date_rdv).toLocaleString() : 'Date pending'}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{item.notes || 'General appointment'}</p>
                <p className="mt-1 text-xs text-slate-500">Vet: {item.veterinaires?.name || item.veterinaire_id || 'Assigned later'}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-700">
                  <MapPin className="h-3.5 w-3.5" />
                  {item.status || 'scheduled'}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-900/10 bg-white p-6">
          <h2 className="font-title text-xl font-semibold text-slate-900">Available veterinarians</h2>
          <p className="mt-1 text-sm text-slate-500">Fetched in real time from your backend.</p>
          <div className="mt-4 space-y-2">
            {loading ? <p className="text-sm text-slate-500">Loading veterinarians...</p> : null}
            {!loading && vets.length === 0 ? <p className="text-sm text-slate-500">No veterinarians found.</p> : null}
            {vets.slice(0, 8).map((vet) => (
              <div key={vet.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{vet.name}</p>
                <p className="text-xs text-slate-500">{vet.specialization || 'General practice'}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageLayout>
  )
}

export default DashboardPage
