import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Tenant } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useTenantQuery } from '../hooks/useTenantQuery'
import { DEFAULT_TENANT_ID } from '../utils/tenantStorage'
import { PASSWORD_HINT } from '../utils/password'
import { CLINIC_TYPE_OPTIONS } from '../clinicTypes'
import { MIN_SEARCH_LENGTH, adminEmailFor } from '../utils/tenantQuery'
import type { TenantSort } from '../utils/tenantQuery'
import { TenantForm } from './TenantForm'
import { ConfirmModal } from './ConfirmModal'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Select } from './common/Select'
import { SearchBox } from './common/SearchBox'
import { ListView } from './common/ListView'
import { cardBase } from './common/Card'
import { Screen } from './common/Screen'
import { ScreenHeader } from './common/ScreenHeader'
import { cx, fieldLabel, fieldLabelText } from '../styles'

function clinicTypeLabel(clinicType: Tenant['clinicType']): string {
  return CLINIC_TYPE_OPTIONS.find((opt) => opt.value === clinicType)?.label ?? clinicType
}

/** Superuser-only tenant management (§5.4/§5.5 of docs/design.md) —
 *  create, search/filter, suspend/reactivate, delete, and reset the admin
 *  password for any tenant. Mirrors the Patients workflow's own shape
 *  (search+filter, paginated ListView, a dedicated add form) so the two
 *  don't feel like different apps. */
export function TenantsScreen() {
  const { tenants, users, updateTenantStatus, deleteTenant, updateUserPassword } = useAuth()
  const {
    search,
    setSearch,
    status,
    setStatus,
    clinicType,
    setClinicType,
    sort,
    setSort,
    resetFilters,
    isFilterActive,
    results,
  } = useTenantQuery(tenants, users)
  const [adding, setAdding] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)

  const submitResetPassword = (e: FormEvent) => {
    e.preventDefault()
    if (!resettingPasswordFor) return
    const admin = users.find((u) => u.tenantId === resettingPasswordFor && u.isFounder)
      ?? users.find((u) => u.tenantId === resettingPasswordFor && u.roles.includes('admin'))
    if (!admin) return
    const result = updateUserPassword(admin.id, newPassword)
    if (!result.ok) {
      setResetError(PASSWORD_HINT)
      return
    }
    setResettingPasswordFor(null)
    setNewPassword('')
    setResetError(null)
  }

  if (adding) {
    return <TenantForm onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
  }

  return (
    <Screen className="gap-3.5">
      <ScreenHeader
        title="Tenants"
        action={
          <Button variant="primary" onClick={() => setAdding(true)}>
            Add tenant
          </Button>
        }
      />

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`Admin email or mobile (${MIN_SEARCH_LENGTH}+ chars)`}
        filter={{
          active: isFilterActive,
          onReset: resetFilters,
          content: (
            <>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Status</span>
                <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Clinic type</span>
                <Select value={clinicType} onChange={(e) => setClinicType(e.target.value as typeof clinicType)}>
                  <option value="">All clinic types</option>
                  {CLINIC_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Sort</span>
                <Select value={sort} onChange={(e) => setSort(e.target.value as TenantSort)}>
                  <option value="default">Newest first</option>
                  <option value="email-asc">Admin email (A-Z)</option>
                  <option value="email-desc">Admin email (Z-A)</option>
                </Select>
              </label>
            </>
          ),
        }}
      />

      <ListView
        items={results}
        getKey={(tenant) => tenant.id}
        itemLabel="tenant"
        emptyMessage={tenants.length === 0 ? 'No tenants yet. Add the first one.' : 'No tenants match.'}
        renderItem={(tenant) => {
          const adminEmail = adminEmailFor(tenant, users)
          const isDefaultTenant = tenant.id === DEFAULT_TENANT_ID

          return (
            <div className={cx(cardBase, 'flex flex-col gap-2')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-text-h">{adminEmail || '(no admin)'}</span>
                <span
                  className={cx(
                    'w-fit rounded-full border px-2 py-0.5 text-[11px] capitalize',
                    tenant.status === 'suspended' ? 'border-high text-high' : 'border-border text-text',
                  )}
                >
                  {tenant.status}
                </span>
              </div>
              <p className="text-[13px] text-text">
                {clinicTypeLabel(tenant.clinicType)} · {tenant.mobile} · created{' '}
                {new Date(tenant.createdAt).toLocaleDateString()}
              </p>

              {resettingPasswordFor === tenant.id ? (
                <form className="flex flex-wrap items-end gap-2.5" onSubmit={submitResetPassword}>
                  <label className={fieldLabel}>
                    <span className={fieldLabelText}>New admin password</span>
                    <TextInput
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      title={PASSWORD_HINT}
                      autoFocus
                      required
                    />
                  </label>
                  <Button type="submit" variant="secondary">
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setResettingPasswordFor(null)
                      setNewPassword('')
                      setResetError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  {resetError && <p className="w-full text-[13px] text-high">{resetError}</p>}
                </form>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={isDefaultTenant}
                    title={isDefaultTenant ? 'The default test tenant cannot be suspended.' : undefined}
                    onClick={() =>
                      updateTenantStatus(tenant.id, tenant.status === 'active' ? 'suspended' : 'active')
                    }
                  >
                    {tenant.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!adminEmail}
                    onClick={() => {
                      setResettingPasswordFor(tenant.id)
                      setNewPassword('')
                      setResetError(null)
                    }}
                  >
                    Reset admin password
                  </Button>
                  <Button
                    variant="danger"
                    disabled={isDefaultTenant}
                    title={isDefaultTenant ? 'The default test tenant cannot be deleted.' : undefined}
                    onClick={() => setConfirmingDeleteId(tenant.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )
        }}
      />

      {confirmingDeleteId && (
        <ConfirmModal
          title="Delete tenant?"
          warning="Permanently deletes this clinic's account, users, and all patient data. This can't be undone."
          mode="typeConfirm"
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => {
            deleteTenant(confirmingDeleteId)
            setConfirmingDeleteId(null)
          }}
          onCancel={() => setConfirmingDeleteId(null)}
        />
      )}
    </Screen>
  )
}
