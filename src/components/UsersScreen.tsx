import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Role } from '../types'
import { useAuth } from '../hooks/useAuth'
import { PASSWORD_HINT, isStrongPassword } from '../utils/password'
import { ConfirmModal } from './ConfirmModal'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Select } from './common/Select'
import { cardBase } from './common/Card'
import { Breadcrumb } from './common/Breadcrumb'
import { card, cx, narrowContent, screenHeading, fieldLabel, fieldLabelText } from '../styles'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'front_desk', label: 'Front desk' },
]

interface Props {
  onBack: () => void
}

/** Tenant-admin-only staff management (§8 of docs/design.md, spec item 8)
 *  — add/delete accounts and reset passwords, scoped to the signed-in
 *  admin's own tenant. `deleteUser`/`updateUserPassword` already enforce
 *  the "can't delete yourself" / "can't drop the last admin" / password-
 *  strength rules server-side (AuthContext); this screen also disables the
 *  affected controls up front so the guard rarely needs to fire. */
export function UsersScreen({ onBack }: Props) {
  const { user, users, createUser, deleteUser, updateUserPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('front_desk')
  const [createError, setCreateError] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)

  const tenantId = user?.tenantId
  if (!tenantId) return null

  const tenantUsers = users.filter((u) => u.tenantId === tenantId)
  const adminCount = tenantUsers.filter((u) => u.role === 'admin').length

  const submitCreate = (e: FormEvent) => {
    e.preventDefault()
    if (!isStrongPassword(password)) {
      setCreateError(PASSWORD_HINT)
      return
    }
    const result = createUser({ email, password, fullName, role, tenantId })
    if (!result.ok) {
      setCreateError(
        result.error === 'duplicate_email' ? 'An account with this email already exists.' : PASSWORD_HINT,
      )
      return
    }
    setEmail('')
    setPassword('')
    setFullName('')
    setRole('front_desk')
    setCreateError(null)
  }

  const submitResetPassword = (e: FormEvent) => {
    e.preventDefault()
    if (!resettingPasswordFor) return
    const result = updateUserPassword(resettingPasswordFor, newPassword)
    if (!result.ok) {
      setResetError(PASSWORD_HINT)
      return
    }
    setResettingPasswordFor(null)
    setNewPassword('')
    setResetError(null)
  }

  const handleDelete = (id: string) => {
    const result = deleteUser(id)
    if (!result.ok) {
      setDeleteError(
        result.error === 'self' ? "You can't delete your own account." : 'A clinic needs at least one admin.',
      )
      setConfirmingDeleteId(null)
      return
    }
    setConfirmingDeleteId(null)
    setDeleteError(null)
  }

  return (
    <div className={`flex flex-col gap-3.5 ${narrowContent}`}>
      <Breadcrumb onClick={onBack} />

      <h2 className={screenHeading}>Users</h2>
      <p className="text-sm text-text">Admin-only. Manage the accounts that can sign in to this clinic.</p>

      <form className={`${card} flex flex-col gap-3.5`} onSubmit={submitCreate}>
        <h3 className="text-base font-bold text-text-h">Add user</h3>

        <div className="flex flex-col gap-3.5 md:flex-row md:gap-2.5">
          <label className={fieldLabel}>
            <span className={fieldLabelText}>Full name</span>
            <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Role</span>
            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Email</span>
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Password</span>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            title={PASSWORD_HINT}
            required
          />
        </label>
        <p className="text-[13px] text-text">{PASSWORD_HINT}</p>

        {createError && <p className="text-[13px] text-high">{createError}</p>}

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Add user
          </Button>
        </div>
      </form>

      {deleteError && <p className="text-[13px] text-high">{deleteError}</p>}

      <ul className="flex flex-col gap-2">
        {tenantUsers.map((u) => {
          const isSelf = u.id === user.id
          const isLastAdmin = u.role === 'admin' && adminCount <= 1
          return (
            <li key={u.id} className={cx(cardBase, 'flex flex-col gap-2')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-text-h">{u.fullName}</span>
                <span className="w-fit rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] capitalize text-text">
                  {u.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[13px] text-text">{u.email}</p>

              {resettingPasswordFor === u.id ? (
                <form className="flex flex-wrap items-end gap-2.5" onSubmit={submitResetPassword}>
                  <label className={fieldLabel}>
                    <span className={fieldLabelText}>New password</span>
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
                    onClick={() => {
                      setResettingPasswordFor(u.id)
                      setNewPassword('')
                      setResetError(null)
                    }}
                  >
                    Reset password
                  </Button>
                  <Button
                    variant="danger"
                    disabled={isSelf || isLastAdmin}
                    title={
                      isSelf
                        ? "You can't delete your own account."
                        : isLastAdmin
                          ? 'A clinic needs at least one admin.'
                          : undefined
                    }
                    onClick={() => setConfirmingDeleteId(u.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {confirmingDeleteId && (
        <ConfirmModal
          title="Delete user?"
          warning="Removes this person's ability to sign in. This can't be undone."
          mode="yesNo"
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => handleDelete(confirmingDeleteId)}
          onCancel={() => setConfirmingDeleteId(null)}
        />
      )}
    </div>
  )
}
