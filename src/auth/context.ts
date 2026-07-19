import { createContext } from 'react'
import type { ClinicType, Role, Tenant, TenantStatus, User } from '../types'

export type LoginResult = { ok: true } | { ok: false; error: 'invalid' | 'suspended' }

/** Same fields whether they come in via self-signup or a superuser
 *  provisioning a tenant (docs/design.md §5.5) — the doctor/address/logo
 *  fields end up on the new tenant's `PrescriptionTemplate` (§5.6), not on
 *  the `Tenant` record itself. */
export interface ClinicProfileInput {
  clinicType: ClinicType
  mobile: string
  clinicName?: string
  clinicAddress?: string
  doctorName?: string
  doctorCredentials?: string
  logoDataUrl?: string
}

export interface SignUpInput extends ClinicProfileInput {
  email: string
  password: string
}

export type SignUpResult = { ok: true } | { ok: false; error: 'duplicate_email' | 'weak_password' }

export interface CreateUserInput {
  email: string
  password: string
  fullName: string
  roles: Role[]
  tenantId: string
}

export type CreateUserResult =
  | { ok: true; id: string }
  | { ok: false; error: 'duplicate_email' | 'weak_password' | 'empty_roles' }

export type DeleteUserResult = { ok: true } | { ok: false; error: 'self' | 'last_admin' }

export type UpdatePasswordResult = { ok: true } | { ok: false; error: 'weak_password' }

export type UpdateRolesResult = { ok: true } | { ok: false; error: 'empty_roles' | 'last_admin' }

export interface AuthContextValue {
  user: User | null
  /** Every account across every tenant, plus the fixed superuser is
   *  excluded (it isn't a persisted record). Callers filter by `tenantId`
   *  for tenant-scoped views (e.g. the Users screen, §8 of docs/design.md). */
  users: User[]
  tenants: Tenant[]
  login: (email: string, password: string) => LoginResult
  logout: () => void
  /** Self-service signup (§5.5) — creates a tenant, seeds its prescription
   *  template from the optional clinic-profile fields, creates its first
   *  user as `admin`, and signs that user in. */
  signUp: (input: SignUpInput) => SignUpResult
  createUser: (input: CreateUserInput) => CreateUserResult
  deleteUser: (id: string) => DeleteUserResult
  updateUserPassword: (id: string, newPassword: string) => UpdatePasswordResult
  /** Replaces a user's held roles outright (not a patch) — a user can hold
   *  more than one at once. Rejects an empty list, and rejects dropping
   *  `admin` from the last `admin` a tenant has left. */
  updateUserRoles: (id: string, roles: Role[]) => UpdateRolesResult
  /** Superuser-only equivalent of `signUp` — provisions a tenant + its
   *  admin user without signing the caller out of their own session. */
  addTenant: (input: SignUpInput) => SignUpResult
  updateTenantStatus: (id: string, status: TenantStatus) => void
  /** Edits the mandatory clinic-profile fields (§5.5) — the same two
   *  fields (mobile, clinic type) captured at signup, later editable from
   *  Preferences by that tenant's own admin, or by the superuser. */
  updateTenantProfile: (id: string, patch: Partial<Pick<Tenant, 'mobile' | 'clinicType'>>) => void
  /** Removes the tenant, every one of its users, and cascade-deletes all of
   *  its clinic data (§5.5). Never allowed on the default tenant. */
  deleteTenant: (id: string) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
