import { Link } from 'react-router-dom'
import TopNavbar from './TopNavbar'

function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_-10%,#daf1e8_0%,transparent_42%),radial-gradient(circle_at_95%_110%,#d8ebff_0%,transparent_38%),#f8f6f0] text-slate-900">
      <TopNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">{children}</main>
      <footer className="mt-10 border-t border-emerald-900/10 bg-white/75">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-title text-xl font-semibold text-slate-900">Veto-Care</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                A modern platform helping owners and veterinarians manage appointments, records, and long-term pet wellness.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Platform</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link to="/" className="hover:text-emerald-700">Home</Link></li>
                <li><Link to="/vets" className="hover:text-emerald-700">Find Vets</Link></li>
                <li><Link to="/profile" className="hover:text-emerald-700">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Services</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Appointment booking</li>
                <li>Digital health records</li>
                <li>Clinic recommendations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Tunis, Tunisia</li>
                <li>support@veto-care.app</li>
                <li>+216 70 000 111</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-emerald-900/10 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Veto-Care. Built for reliable pet healthcare.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PageLayout
