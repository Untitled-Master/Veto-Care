import { MapPin, Search, Star, Stethoscope } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import PageLayout from '../components/PageLayout'
import { apiRequest } from '../lib/api'

function VetsPage() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vets, setVets] = useState([])
  const [selectedVet, setSelectedVet] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [portfolioLoading, setPortfolioLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : ''
        const data = await apiRequest(`/vets${params}`, { skipAuth: true })
        setVets(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const openPortfolio = async (vet) => {
    setSelectedVet(vet)
    setPortfolioLoading(true)

    try {
      const data = await apiRequest(`/vets/${vet.id}/portfolio`, { skipAuth: true })
      setPortfolio(data)
    } catch (err) {
      setPortfolio({
        ...vet,
        portfolio: {
          title: `${vet.name} Portfolio`,
          bio: err.message,
          specialties: [vet.specialization].filter(Boolean),
          clinic_address: vet.clinic_address || 'Not provided'
        }
      })
    } finally {
      setPortfolioLoading(false)
    }
  }

  const highlighted = useMemo(() => vets.slice(0, 8), [vets])

  return (
    <PageLayout>
      <section className="mb-8">
        <p className="text-sm text-slate-500">Browse professionals</p>
        <h1 className="font-title text-4xl font-semibold text-slate-900 md:text-5xl">Veterinarian Portfolios</h1>
      </section>

      <section className="mb-6 rounded-2xl border border-emerald-900/10 bg-white p-5">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Search vets by name, specialty, or email</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="text"
            className="w-full border-none bg-transparent p-0 text-sm outline-none"
            placeholder="Search veterinarians..."
          />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-emerald-900/10 bg-white p-5">
          <h2 className="font-title text-xl text-slate-900">Results</h2>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
          {loading ? <p className="mt-3 text-sm text-slate-500">Loading veterinarians...</p> : null}
          {!loading && highlighted.length === 0 ? <p className="mt-3 text-sm text-slate-500">No veterinarians found.</p> : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {highlighted.map((vet) => (
              <button
                key={vet.id}
                type="button"
                onClick={() => openPortfolio(vet)}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <p className="font-medium text-slate-900">{vet.name}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-700" />
                  {vet.specialization || 'General practice'}
                </p>
                <p className="mt-1 text-xs text-slate-500">{vet.email}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600">
                  <Star className="h-3.5 w-3.5" />
                  {vet.rating || 0} / 5
                </p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-900/10 bg-white p-5">
          <h2 className="font-title text-xl text-slate-900">Portfolio details</h2>
          {!selectedVet ? <p className="mt-3 text-sm text-slate-500">Select a veterinarian to view the full portfolio.</p> : null}
          {portfolioLoading ? <p className="mt-3 text-sm text-slate-500">Loading portfolio...</p> : null}
          {portfolio && !portfolioLoading ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-lg font-semibold text-slate-900">{portfolio.name}</p>
                <p className="text-sm text-slate-600">{portfolio.portfolio?.title || 'Portfolio'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-700">{portfolio.portfolio?.bio || 'No biography provided.'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <p className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-cyan-700" /> {portfolio.portfolio?.clinic_address || 'Address unavailable'}</p>
                <p className="mt-2">Specialties: {(portfolio.portfolio?.specialties || []).join(', ') || 'N/A'}</p>
                <p className="mt-1">Experience: {portfolio.portfolio?.stats?.years_experience || 0} years</p>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </PageLayout>
  )
}

export default VetsPage
