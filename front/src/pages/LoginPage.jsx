import { ArrowRight, KeyRound, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { apiRequest } from '../lib/api'
import { setSession } from '../lib/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMode, setLoginMode] = useState('owner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    try {
      setLoading(true)
      const endpoint = loginMode === 'vet' ? '/auth/login-vet' : '/auth/login'
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      })

      if (!data?.session?.access_token || !data?.user) {
        throw new Error('Login response is invalid. Please try again.')
      }

      setSession(data.session, data.user, {
        role: data.role || loginMode,
        vet_profile: data.vet_profile || null
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout>
      <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <ArrowRight className="h-3.5 w-3.5" />
            Welcome back
          </p>
          <h1 className="mt-4 font-title text-3xl font-semibold leading-tight text-slate-900">
            Sign in to continue caring for your pets.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Access your appointments, medical uploads, and nearby clinic dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(14,116,144,0.45)]">
          <h2 className="font-title text-2xl font-semibold text-slate-900">Login</h2>
          <p className="mt-1 text-sm text-slate-500">Use your Veto-Care account credentials.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setLoginMode('owner')}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                loginMode === 'owner' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Pet Owner
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('vet')}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                loginMode === 'vet' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-white'
              }`}
            >
              Veterinarian
            </button>
          </div>
          <div className="mt-6 space-y-4">
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
          <button type="submit" disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 font-medium text-emerald-50 transition hover:bg-emerald-900 disabled:opacity-60">
            {loading ? 'Signing in...' : 'Login'}
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-center text-sm text-slate-600">
            New here?{' '}
            <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </PageLayout>
  )
}

export default LoginPage
