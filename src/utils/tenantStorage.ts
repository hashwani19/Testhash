import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useAuth } from '../hooks/useAuth'

/** The tenant that owns every account/record created before multi-tenancy
 *  existed. Its storage keys are kept exactly as they were (no suffix) so
 *  the existing seeded admin/doctor/front_desk accounts and their data are
 *  completely unaffected by tenant-scoping (§5.5/§8.1 of docs/design.md). */
export const DEFAULT_TENANT_ID = 'default'

/** Every per-clinic base storage key that gets tenant-scoped. Used both by
 *  each hook/provider to derive its own key and by `deleteTenantStorage`
 *  to cascade-delete a removed tenant's data. */
export const TENANT_SCOPED_BASE_KEYS = [
  'testhash.patients.v1',
  'testhash.eyeVisits.v1',
  'testhash.appointments.v1',
  'testhash.attachments.v1',
  'testhash.auditLog.v1',
  'testhash.settings.v1',
  'testhash.prescriptionTemplate.v1',
] as const

export function tenantStorageKey(baseKey: string, tenantId: string): string {
  return tenantId === DEFAULT_TENANT_ID ? baseKey : `${baseKey}.tenant.${tenantId}`
}

/** The signed-in user's tenant, or `DEFAULT_TENANT_ID` for the handful of
 *  contexts with no signed-in tenant user (e.g. before login resolves). The
 *  `super_user` account is never scoped to a tenant and never mounts any of
 *  the hooks that call this. */
export function useCurrentTenantId(): string {
  const { user } = useAuth()
  return user?.tenantId ?? DEFAULT_TENANT_ID
}

/** Cascade-delete every piece of a tenant's clinic data. Never touches the
 *  default tenant, even if somehow called with its id. */
export function deleteTenantStorage(tenantId: string): void {
  if (tenantId === DEFAULT_TENANT_ID) return
  for (const baseKey of TENANT_SCOPED_BASE_KEYS) {
    localStorage.removeItem(tenantStorageKey(baseKey, tenantId))
  }
}

/**
 * Shared mechanics behind every tenant-scoped hook/provider (usePatients,
 * useEyeVisits, AuditLogProvider, etc.): load from the current tenant's
 * storage key, persist on every change, and — since these hooks live inside
 * `AppShell`, which stays mounted across login/logout/signup rather than
 * remounting — synchronously reset to the new tenant's data when the
 * signed-in tenant changes. The reset happens during render (comparing
 * against the previous key) rather than in a useEffect, so there's no
 * one-frame flash of the previous tenant's (or an empty) list before the
 * effect catches up — this is React's documented pattern for resetting
 * state when a derived value changes.
 */
export function useTenantStorageState<T>(
  baseKey: string,
  load: (storageKey: string, tenantId: string) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const tenantId = useCurrentTenantId()
  const storageKey = tenantStorageKey(baseKey, tenantId)
  const [key, setKey] = useState(storageKey)
  const [value, setValue] = useState<T>(() => load(storageKey, tenantId))

  if (storageKey !== key) {
    setKey(storageKey)
    setValue(load(storageKey, tenantId))
  }

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }, [storageKey, value])

  return [value, setValue]
}
