const TOKEN_KEY = 'veto_care_token'
const USER_KEY = 'veto_care_user'
const ROLE_KEY = 'veto_care_role'
const VET_PROFILE_KEY = 'veto_care_vet_profile'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(session, user, extra = {}) {
  if (session?.access_token) {
    localStorage.setItem(TOKEN_KEY, session.access_token)
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  if (extra.role) {
    localStorage.setItem(ROLE_KEY, extra.role)
  } else {
    localStorage.setItem(ROLE_KEY, 'owner')
  }

  if (extra.vet_profile) {
    localStorage.setItem(VET_PROFILE_KEY, JSON.stringify(extra.vet_profile))
  } else {
    localStorage.removeItem(VET_PROFILE_KEY)
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(VET_PROFILE_KEY)
}

export function getUser() {
  const rawUser = localStorage.getItem(USER_KEY)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(getToken())
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || 'owner'
}

export function getVetProfile() {
  const rawVetProfile = localStorage.getItem(VET_PROFILE_KEY)
  if (!rawVetProfile) return null

  try {
    return JSON.parse(rawVetProfile)
  } catch {
    return null
  }
}
