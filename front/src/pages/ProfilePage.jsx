import { Save, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'
import { apiRequest } from '../lib/api'
import { getRole, getUser, getVetProfile } from '../lib/auth'

function ProfilePage() {
  const user = getUser()
  const role = getRole()
  const vetProfile = getVetProfile()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    bio: '',
    avatar_url: '',
    pet_name: '',
    pet_type: '',
    pet_breed: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const data = await apiRequest('/auth/profile')

        if (data?.profile) {
          setForm((prev) => ({ ...prev, ...data.profile }))
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      setSaving(true)
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== null && value !== undefined)
      )

      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout>
      <section className="mb-6">
        <p className="text-sm text-slate-500">Manage your account</p>
        <h1 className="font-title text-4xl font-semibold text-slate-900">Profile</h1>
      </section>

      <section className="mb-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-2xl border border-emerald-900/10 bg-white p-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <UserRound className="h-7 w-7" />
          </div>
          <h2 className="mt-3 font-title text-xl text-slate-900">{user?.email || 'User account'}</h2>
          <p className="mt-1 text-sm text-slate-600">Role: {role === 'vet' ? 'Veterinarian' : 'Pet owner'}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Authenticated account
          </p>

          {role === 'vet' && vetProfile ? (
            <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-cyan-800">
                <Stethoscope className="h-4 w-4" />
                Vet portfolio linked
              </p>
              <p className="mt-2 text-sm text-cyan-900">{vetProfile.name}</p>
              <p className="text-xs text-cyan-700">{vetProfile.specialization || 'General practice'}</p>
            </div>
          ) : null}
        </article>

        <form onSubmit={saveProfile} className="rounded-2xl border border-emerald-900/10 bg-white p-6">
          <h2 className="font-title text-2xl text-slate-900">Edit details</h2>
          <p className="mt-1 text-sm text-slate-500">This updates your backend profile record.</p>

          {loading ? <p className="mt-4 text-sm text-slate-500">Loading profile...</p> : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={form.full_name || ''} onChange={(e) => updateField('full_name', e.target.value)} placeholder="Full name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.city || ''} onChange={(e) => updateField('city', e.target.value)} placeholder="City" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.avatar_url || ''} onChange={(e) => updateField('avatar_url', e.target.value)} placeholder="Avatar URL" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.pet_name || ''} onChange={(e) => updateField('pet_name', e.target.value)} placeholder="Pet name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.pet_type || ''} onChange={(e) => updateField('pet_type', e.target.value)} placeholder="Pet type" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.pet_breed || ''} onChange={(e) => updateField('pet_breed', e.target.value)} placeholder="Pet breed" className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
            <textarea value={form.bio || ''} onChange={(e) => updateField('bio', e.target.value)} placeholder="Bio" className="min-h-28 rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
          </div>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

          <button type="submit" disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>
    </PageLayout>
  )
}

export default ProfilePage
