import { ArrowRight, KeyRound, Mail, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { apiRequest } from '../lib/api'

function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      })

      setSuccess('Account created successfully. You can now log in.')

      if (fullName || phone) {
        localStorage.setItem('veto_care_profile_hint', JSON.stringify({ fullName, phone }))
      }

      setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1fr] md:items-start">
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-8">
          <h1 className="font-title text-3xl font-semibold leading-tight text-slate-900">Create your Veto-Care account</h1>
          <p className="mt-3 text-sm text-slate-600">
            Join pet owners and veterinarians using one modern platform for appointments, records, and follow-up care.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="rounded-xl bg-emerald-50 px-3 py-2">Book vets quickly with smart scheduling.</li>
            <li className="rounded-xl bg-cyan-50 px-3 py-2">Store health documents securely.</li>
            <li className="rounded-xl bg-amber-50 px-3 py-2">Track all your visits in one dashboard.</li>
          </ul>
        </div>

        <form onSubmit={handleRegister} className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(21,128,61,0.35)]">
          <h2 className="font-title text-2xl font-semibold text-slate-900">Register</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Full name</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
                <UserRound className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-800 outline-none"
                  placeholder="Belma User"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Email</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-800 outline-none"
                  placeholder="owner@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Phone</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-800 outline-none"
                  placeholder="+216 XX XXX XXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
                <KeyRound className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  className="w-full border-none bg-transparent p-0 text-sm text-slate-800 outline-none"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="mt-4 text-sm text-emerald-700">{success}</p> : null}
          <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 font-medium text-emerald-50 transition hover:bg-emerald-900 disabled:opacity-60">
            {loading ? 'Creating account...' : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
              Login now
            </Link>
          </p>
        </form>
      </section>
    </PageLayout>
  )
}

export default RegisterPage
