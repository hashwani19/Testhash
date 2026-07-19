import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Tenant } from '../types'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_TENANT_ID } from '../utils/tenantStorage'
import { PASSWORD_HINT, isStrongPassword } from '../utils/password'
import { CLINIC_TYPE_OPTIONS } from '../clinicTypes'
import { ClinicProfileFields } from './ClinicProfileFields'
import { EMPTY_CLINIC_PROFILE } from '../utils/clinicProfile'
import type { ClinicProfileValue } from '../utils/clinicProfile'
import { ConfirmModal } from './ConfirmModal'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { cardBase } from './common/Card'
import { card, cx, screenHeading, fieldLabel, fieldLabelText } from '../styles'

function clinicTypeLabel(clinicType: Tenant['clinicType']): string {
  return CLINIC_TYPE_OPTIONS.find((opt) => opt.value === clinicType)?.label ?? clinicType
}

/** Superuser-only tenant management (§5.5 of docs/design.md) — create,
 *  suspend/reactivate, delete, and reset the admin password for any
 *  tenant. Mirrors self-signup's own fields (§1) since provisioning a
 *  tenant here does exactly what a clinic signing up itself would do. */
export function TenantsScreen() {
  const { tenants, users, addTenant, updateTenantStatus, deleteTenant, updateUserPassword } = useAuth()
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [profile, setProfile] = useState<ClinicProfileValue>(EMPTY_CLINIC_PROFILE)
  const [createError, setCreateError] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)

  const adminFor = (tenantId: string) => users.find((u) => u.tenantId === tenantId && u.role === 'admin')

  const resetCreateForm = () => {
    setEmail('')
    setPassword('')
    setRepeatPassword('')
    setProfile(EMPTY_CLINIC_PROFILE)
    setCreateError(null)
  }

  const submitCreate = (e: FormEvent) => {
    e.preventDefault()
    if (password !== repeatPassword) {
      setCreateError('Passwords do not match.')
      return
    }
    if (!isStrongPassword(password)) {
      setCreateError(PASSWORD_HINT)
      return
    }
    const result = addTenant({
      email,
      password,
      mobile: profile.mobile,
      clinicType: profile.clinicType,
      clinicName: profile.clinicName || undefined,
      clinicAddress: profile.clinicAddress || undefined,
      doctorName: profile.doctorName || undefined,
      doctorCredentials: profile.doctorCredentials || undefined,
      logoDataUrl: profile.logoDataUrl || undefined,
    })
    if (!result.ok) {
      setCreateError(
        result.error === 'duplicate_email' ? 'An account with this email already exists.' : PASSWORD_HINT,
      )
      return
    }
    resetCreateForm()
    setCreating(false)
  }

  const submitResetPassword = (e: FormEvent) => {
    e.preventDefault()
    if (!resettingPasswordFor) return
    const admin = adminFor(resettingPasswordFor)
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

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className={screenHeading}>Tenants</h2>
        {!creating && (
          <Button variant="primary" onClick={() => setCreating(true)}>
            Add tenant
          </Button>
        )}
      </div>

      {creating && (
        <form className={`${card} flex flex-col gap-3.5`} onSubmit={submitCreate}>
          <h3 className="text-base font-bold text-text-h">New clinic</h3>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Admin email</span>
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <div className="flex flex-col gap-3.5 md:flex-row md:gap-2.5">
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Admin password</span>
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                title={PASSWORD_HINT}
                required
              />
            </label>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Repeat password</span>
              <TextInput
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <p className="text-[13px] text-text">{PASSWORD_HINT}</p>

          <ClinicProfileFields value={profile} onChange={setProfile} />

          {createError && <p className="text-[13px] text-high">{createError}</p>}

          <div className="flex justify-end gap-2.5">
            <Button
              variant="secondary"
              onClick={() => {
                resetCreateForm()
                setCreating(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create tenant
            </Button>
          </div>
        </form>
      )}

      {tenants.length === 0 ? (
        <p className="py-8 text-center text-sm text-text">No tenants yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {tenants.map((tenant) => {
            const admin = adminFor(tenant.id)
            const isDefaultTenant = tenant.id === DEFAULT_TENANT_ID

            return (
              <li key={tenant.id} className={cx(cardBase, 'flex flex-col gap-2')}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-text-h">{admin?.email ?? '(no admin)'}</span>
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
                      disabled={!admin}
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
              </li>
            )
          })}
        </ul>
      )}

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
    </div>
  )
}
