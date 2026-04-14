import {
  ChevronDown,
  LogOut,
  Menu,
  PawPrint,
  ShieldCheck,
  UserRound,
  X
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { clearSession, getRole, getUser, isAuthenticated } from '../lib/auth'

const guestLinks = [
  { to: '/', label: 'Home' },
  { to: '/vets', label: 'Find Vets' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' }
]

const userLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vets', label: 'Find Vets' },
  { to: '/profile', label: 'Profile' }
]

function TopNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const loggedIn = isAuthenticated()
  const user = getUser()
  const role = getRole()

  const links = useMemo(() => (loggedIn ? userLinks : guestLinks), [loggedIn])

  const initials = (user?.email || 'VC')
    .slice(0, 2)
    .toUpperCase()

  const logout = () => {
    clearSession()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white">
            <PawPrint className="h-5 w-5" />
          </span>
          <span>
            <span className="font-title block text-lg leading-none text-slate-900">Veto-Care</span>
            <span className="text-xs text-slate-500">Digital Vet Platform</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="ml-2 inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Services
              <ChevronDown className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <Link to="/vets" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">Veterinarian portfolios</Link>
                {loggedIn ? <Link to="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">Appointments analytics</Link> : null}
                {loggedIn ? <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">Profile management</Link> : null}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <p className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {role === 'vet' ? 'Veterinarian account' : 'Pet owner account'}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-xs font-semibold text-cyan-900">
                  {initials}
                </span>
                <div className="max-w-[180px]">
                  <p className="truncate text-xs font-medium text-slate-800">{user?.email || 'Signed in'}</p>
                  <p className="text-[11px] text-slate-500">View bio in Profile</p>
                </div>
                <button type="button" onClick={logout} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
              Get Started
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="space-y-1">
            {links.map((item) => (
              <NavLink
                key={`${item.to}-mobile`}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  location.pathname === item.to ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {loggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
            >
              <UserRound className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      ) : null}
    </header>
  )
}

export default TopNavbar
