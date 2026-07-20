import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { PrescriptionTemplate, Role, Tenant, TenantStatus, User } from '../types'
import { sanitizeText } from '../utils/sanitize'
import { isStrongPassword } from '../utils/password'
import { DEFAULT_TENANT_ID, deleteTenantStorage, tenantStorageKey } from '../utils/tenantStorage'
import { AuthContext } from './context'
import type {
  CreateUserInput,
  CreateUserResult,
  DeleteUserResult,
  LoginResult,
  SignUpInput,
  SignUpResult,
  UpdatePasswordResult,
  UpdateRolesResult,
} from './context'

const USERS_KEY = 'testhash.users.v1'
const TENANTS_KEY = 'testhash.tenants.v1'
const SESSION_KEY = 'testhash.session.v1'
const PRESCRIPTION_TEMPLATE_BASE_KEY = 'testhash.prescriptionTemplate.v1'

/** Fixed test credentials (spec: "keep a fixed name and password for
 *  test") — not a persisted `User` record, so it never appears in `users`,
 *  can't be edited/deleted, and is excluded from the default tenant. */
const SUPER_USER_ID = 'super-user'
const SUPER_USER_EMAIL = 'superuser@testhash.local'
const SUPER_USER_PASSWORD = 'SuperUser#2026'
const SUPER_USER: User = {
  id: SUPER_USER_ID,
  email: SUPER_USER_EMAIL,
  password: SUPER_USER_PASSWORD,
  fullName: 'Super User',
  roles: ['super_user'],
  createdAt: 0,
}

const SEED_USERS: User[] = [
  {
    id: 'seed-admin',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Alex Admin',
    roles: ['admin'],
    tenantId: DEFAULT_TENANT_ID,
    isFounder: true,
    createdAt: Date.now(),
  },
  {
    id: 'seed-doctor',
    email: 'doctor@example.com',
    password: 'doctor123',
    fullName: 'Dr. Dana Doctor',
    roles: ['doctor'],
    tenantId: DEFAULT_TENANT_ID,
    createdAt: Date.now(),
  },
  {
    id: 'seed-frontdesk',
    email: 'frontdesk@example.com',
    password: 'frontdesk123',
    fullName: 'Frankie Frontdesk',
    roles: ['front_desk'],
    tenantId: DEFAULT_TENANT_ID,
    createdAt: Date.now(),
  },
]

const SEED_TENANTS: Tenant[] = [
  {
    id: DEFAULT_TENANT_ID,
    clinicType: 'ophthalmology',
    mobile: '9800000000',
    status: 'active',
    createdAt: Date.now(),
  },
]

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) return JSON.parse(raw) as User[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS))
  return SEED_USERS
}

function loadTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem(TENANTS_KEY)
    if (raw) return JSON.parse(raw) as Tenant[]
  } catch {
    // fall through to reseed
  }
  localStorage.setItem(TENANTS_KEY, JSON.stringify(SEED_TENANTS))
  return SEED_TENANTS
}

function loadSessionUserId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

/** "himanshu.ashwani" -> "Himanshu Ashwani". Signup only asks for an email
 *  + password (§5.5) — there's no separate "your name" field, since the
 *  signed-up account isn't necessarily the doctor (that's the optional,
 *  letterhead-only `doctorName`) — so the account's display name is
 *  derived from the email itself. */
function deriveFullNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email
  const words = local
    .split(/[._+-]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
  return words.length > 0 ? words.join(' ') : email
}

/** Seeds the new tenant's prescription template directly in localStorage
 *  rather than through PrescriptionTemplateProvider's React state — that
 *  provider is already mounted and scoped to whichever tenant is *currently*
 *  signed in, so calling its `updateTemplate` right after `signUp`/`addTenant`
 *  would race against it re-rendering for the new tenant. Writing the
 *  storage key directly sidesteps that ordering hazard entirely.
 *
 *  Always writes (unlike the optional fields below, `clinicName` is
 *  mandatory and validated by the caller before this ever runs) since it's
 *  also the tenant's app-wide display name (§8.0), not just letterhead
 *  content that can be safely left unset. */
function seedPrescriptionTemplate(tenantId: string, input: SignUpInput): void {
  const template: PrescriptionTemplate = {
    showLetterhead: true,
    topMarginMm: 0,
    clinicName: sanitizeText(input.clinicName),
    clinicAddress: input.clinicAddress ? sanitizeText(input.clinicAddress) || undefined : undefined,
    doctorName: input.doctorName ? sanitizeText(input.doctorName) || undefined : undefined,
    doctorCredentials: input.doctorCredentials
      ? sanitizeText(input.doctorCredentials) || undefined
      : undefined,
    logoDataUrl: input.logoDataUrl || undefined,
  }
  localStorage.setItem(tenantStorageKey(PRESCRIPTION_TEMPLATE_BASE_KEY, tenantId), JSON.stringify(template))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadUsers())
  const [tenants, setTenants] = useState<Tenant[]>(() => loadTenants())
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => loadSessionUserId())

  // Computed up front (rather than at the bottom, as `user`) so the
  // tenant-admin-only mutations below can authorize the *caller*, not just
  // validate the target — "never trust the client" extended to which
  // account is asking, not only what it's asking for (§10 of docs/design.md).
  const currentUser =
    sessionUserId === SUPER_USER_ID ? SUPER_USER : (users.find((u) => u.id === sessionUserId) ?? null)

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants))
  }, [tenants])

  useEffect(() => {
    if (sessionUserId) localStorage.setItem(SESSION_KEY, sessionUserId)
    else localStorage.removeItem(SESSION_KEY)
  }, [sessionUserId])

  const login = useCallback(
    (email: string, password: string): LoginResult => {
      const normalizedEmail = email.trim().toLowerCase()
      if (normalizedEmail === SUPER_USER_EMAIL && password === SUPER_USER_PASSWORD) {
        setSessionUserId(SUPER_USER_ID)
        return { ok: true }
      }
      const match = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.password === password)
      if (!match) return { ok: false, error: 'invalid' }
      const tenant = tenants.find((t) => t.id === match.tenantId)
      if (tenant?.status === 'suspended') return { ok: false, error: 'suspended' }
      setSessionUserId(match.id)
      return { ok: true }
    },
    [users, tenants],
  )

  const logout = useCallback(() => setSessionUserId(null), [])

  const emailTaken = useCallback((email: string) => users.some((u) => u.email.toLowerCase() === email), [users])

  const signUp = useCallback(
    (input: SignUpInput): SignUpResult => {
      const normalizedEmail = input.email.trim().toLowerCase()
      if (emailTaken(normalizedEmail) || normalizedEmail === SUPER_USER_EMAIL) {
        return { ok: false, error: 'duplicate_email' }
      }
      if (!isStrongPassword(input.password)) return { ok: false, error: 'weak_password' }
      if (!input.clinicName.trim()) return { ok: false, error: 'missing_clinic_name' }

      const tenantId = crypto.randomUUID()
      const tenant: Tenant = {
        id: tenantId,
        clinicType: input.clinicType,
        mobile: sanitizeText(input.mobile),
        status: 'active',
        createdAt: Date.now(),
      }
      const adminUser: User = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        password: input.password,
        fullName: deriveFullNameFromEmail(normalizedEmail),
        roles: ['admin'],
        tenantId,
        isFounder: true,
        createdAt: Date.now(),
      }
      seedPrescriptionTemplate(tenantId, input)
      setTenants((prev) => [...prev, tenant])
      setUsers((prev) => [...prev, adminUser])
      setSessionUserId(adminUser.id)
      return { ok: true }
    },
    [emailTaken],
  )

  const addTenant = useCallback(
    (input: SignUpInput): SignUpResult => {
      const normalizedEmail = input.email.trim().toLowerCase()
      if (emailTaken(normalizedEmail) || normalizedEmail === SUPER_USER_EMAIL) {
        return { ok: false, error: 'duplicate_email' }
      }
      if (!isStrongPassword(input.password)) return { ok: false, error: 'weak_password' }
      if (!input.clinicName.trim()) return { ok: false, error: 'missing_clinic_name' }

      const tenantId = crypto.randomUUID()
      const tenant: Tenant = {
        id: tenantId,
        clinicType: input.clinicType,
        mobile: sanitizeText(input.mobile),
        status: 'active',
        createdAt: Date.now(),
      }
      const adminUser: User = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        password: input.password,
        fullName: deriveFullNameFromEmail(normalizedEmail),
        roles: ['admin'],
        tenantId,
        isFounder: true,
        createdAt: Date.now(),
      }
      seedPrescriptionTemplate(tenantId, input)
      setTenants((prev) => [...prev, tenant])
      setUsers((prev) => [...prev, adminUser])
      return { ok: true }
    },
    [emailTaken],
  )

  const createUser = useCallback(
    (input: CreateUserInput): CreateUserResult => {
      if (!currentUser?.roles.includes('admin') || !currentUser.tenantId) {
        return { ok: false, error: 'forbidden' }
      }
      const normalizedEmail = input.email.trim().toLowerCase()
      if (emailTaken(normalizedEmail) || normalizedEmail === SUPER_USER_EMAIL) {
        return { ok: false, error: 'duplicate_email' }
      }
      if (!isStrongPassword(input.password)) return { ok: false, error: 'weak_password' }
      if (input.roles.length === 0) return { ok: false, error: 'empty_roles' }
      const newUser: User = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        password: input.password,
        fullName: sanitizeText(input.fullName),
        roles: input.roles,
        // Never the caller-supplied tenant — always the admin's own, so a
        // tenant admin can only ever add staff to their own clinic.
        tenantId: currentUser.tenantId,
        createdAt: Date.now(),
      }
      setUsers((prev) => [...prev, newUser])
      return { ok: true, id: newUser.id }
    },
    [emailTaken, currentUser],
  )

  const deleteUser = useCallback(
    (id: string): DeleteUserResult => {
      if (!currentUser?.roles.includes('admin')) return { ok: false, error: 'forbidden' }
      if (id === sessionUserId) return { ok: false, error: 'self' }
      const target = users.find((u) => u.id === id)
      if (!target) return { ok: true }
      if (target.tenantId !== currentUser.tenantId) return { ok: false, error: 'forbidden' }
      if (target.roles.includes('admin')) {
        const remainingAdmins = users.filter(
          (u) => u.tenantId === target.tenantId && u.roles.includes('admin') && u.id !== id,
        )
        if (remainingAdmins.length === 0) return { ok: false, error: 'last_admin' }
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
      return { ok: true }
    },
    [users, sessionUserId, currentUser],
  )

  const updateUserPassword = useCallback(
    (id: string, newPassword: string): UpdatePasswordResult => {
      if (!isStrongPassword(newPassword)) return { ok: false, error: 'weak_password' }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, password: newPassword } : u)))
      return { ok: true }
    },
    [],
  )

  const updateUserRoles = useCallback(
    (id: string, roles: Role[]): UpdateRolesResult => {
      if (!currentUser?.roles.includes('admin')) return { ok: false, error: 'forbidden' }
      if (roles.length === 0) return { ok: false, error: 'empty_roles' }
      const target = users.find((u) => u.id === id)
      if (!target) return { ok: true }
      if (target.tenantId !== currentUser.tenantId) return { ok: false, error: 'forbidden' }
      if (target.isFounder && !roles.includes('admin')) return { ok: false, error: 'founder' }
      if (target.roles.includes('admin') && !roles.includes('admin')) {
        const remainingAdmins = users.filter(
          (u) => u.tenantId === target.tenantId && u.roles.includes('admin') && u.id !== id,
        )
        if (remainingAdmins.length === 0) return { ok: false, error: 'last_admin' }
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, roles } : u)))
      return { ok: true }
    },
    [users, currentUser],
  )

  const updateTenantStatus = useCallback((id: string, status: TenantStatus) => {
    // The default tenant carries the pre-existing seeded admin/doctor/
    // front_desk test accounts (§5.5 — "should not impact the current...
    // login") — never let it be suspended, even via a stray call.
    if (id === DEFAULT_TENANT_ID) return
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])

  const updateTenantProfile = useCallback(
    (id: string, patch: Partial<Pick<Tenant, 'mobile'>>) => {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, ...patch, mobile: patch.mobile !== undefined ? sanitizeText(patch.mobile) : t.mobile }
            : t,
        ),
      )
    },
    [],
  )

  const deleteTenant = useCallback(
    (id: string) => {
      if (id === DEFAULT_TENANT_ID) return
      setTenants((prev) => prev.filter((t) => t.id !== id))
      setUsers((prev) => prev.filter((u) => u.tenantId !== id))
      deleteTenantStorage(id)
    },
    [],
  )

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        users,
        tenants,
        login,
        logout,
        signUp,
        createUser,
        deleteUser,
        updateUserPassword,
        updateUserRoles,
        addTenant,
        updateTenantStatus,
        updateTenantProfile,
        deleteTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
