import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Role } from '../types'
import { useAuth } from '../hooks/useAuth'
import { useUserQuery } from '../hooks/useUserQuery'
import { PASSWORD_HINT } from '../utils/password'
import { ROLE_OPTIONS, formatRole } from '../utils/roles'
import { MIN_SEARCH_LENGTH } from '../utils/userQuery'
import type { UserSort } from '../utils/userQuery'
import { RoleCheckboxes } from './RoleCheckboxes'
import { UserForm } from './UserForm'
import { ConfirmModal } from './ConfirmModal'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Select } from './common/Select'
import { SearchBox } from './common/SearchBox'
import { ListView } from './common/ListView'
import { cardBase } from './common/Card'
import { Breadcrumb } from './common/Breadcrumb'
import { Screen } from './common/Screen'
import { cx, screenHeading, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  onBack: () => void
}

/** Tenant-admin-only staff management (§8 of docs/design.md, spec item 8)
 *  — search/filter, add, delete accounts, reset passwords, and edit
 *  roles, scoped to the signed-in admin's own tenant. Mirrors the
 *  Patients/Tenants workflows' own shape: `SearchBox` + a query hook feed
 *  a paginated `common/ListView`, and "Add user" opens a dedicated
 *  `common/FormCard`-based form that replaces the list. `deleteUser`/
 *  `updateUserPassword`/`updateUserRoles` already enforce the "can't
 *  delete yourself" / "can't drop the last admin" / password-strength
 *  rules server-side (AuthContext); this screen also disables the
 *  affected controls up front so the guard rarely needs to fire. */
export function UsersScreen({ onBack }: Props) {
  const { user, users, deleteUser, updateUserPassword, updateUserRoles } = useAuth()
  const tenantId = user?.tenantId
  const tenantUsers = users.filter((u) => u.tenantId === tenantId)
  const {
    search,
    setSearch,
    role,
    setRole,
    sort,
    setSort,
    resetFilters,
    isFilterActive,
    results,
  } = useUserQuery(tenantUsers)

  const [adding, setAdding] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [resettingPasswordFor, setResettingPasswordFor] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [editingRolesFor, setEditingRolesFor] = useState<string | null>(null)
  const [editingRoles, setEditingRoles] = useState<Role[]>([])
  const [editRolesError, setEditRolesError] = useState<string | null>(null)

  if (!tenantId || !user) return null

  const adminCount = tenantUsers.filter((u) => u.roles.includes('admin')).length

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

  const submitEditRoles = (e: FormEvent) => {
    e.preventDefault()
    if (!editingRolesFor) return
    const result = updateUserRoles(editingRolesFor, editingRoles)
    if (!result.ok) {
      setEditRolesError(
        result.error === 'empty_roles'
          ? 'Pick at least one role.'
          : result.error === 'founder'
            ? "This is the clinic's original admin and can't lose the admin role."
            : 'A clinic needs at least one admin.',
      )
      return
    }
    setEditingRolesFor(null)
    setEditRolesError(null)
  }

  const handleDelete = (id: string) => {
    const result = deleteUser(id)
    if (!result.ok) {
      setDeleteError(
        result.error === 'self'
          ? "You can't delete your own account."
          : result.error === 'last_admin'
            ? 'A clinic needs at least one admin.'
            : "You don't have permission to do this.",
      )
      setConfirmingDeleteId(null)
      return
    }
    setConfirmingDeleteId(null)
    setDeleteError(null)
  }

  if (adding) {
    return <UserForm onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
  }

  return (
    <Screen className="gap-3.5">
      <Breadcrumb onClick={onBack} />

      <div className="flex items-center justify-between gap-2">
        <h2 className={screenHeading}>Users</h2>
        <Button variant="primary" onClick={() => setAdding(true)}>
          Add user
        </Button>
      </div>
      <p className="text-sm text-text">Admin-only. Manage the accounts that can sign in to this clinic.</p>

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder={`Name or email (${MIN_SEARCH_LENGTH}+ chars)`}
        filter={{
          active: isFilterActive,
          onReset: resetFilters,
          content: (
            <>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Role</span>
                <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                  <option value="">All roles</option>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className={fieldLabel}>
                <span className={fieldLabelText}>Sort</span>
                <Select value={sort} onChange={(e) => setSort(e.target.value as UserSort)}>
                  <option value="default">Newest first</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </Select>
              </label>
            </>
          ),
        }}
      />

      {deleteError && <p className="text-[13px] text-high">{deleteError}</p>}

      <ListView
        items={results}
        getKey={(u) => u.id}
        itemLabel="user"
        emptyMessage={tenantUsers.length === 0 ? 'No users yet.' : 'No users match.'}
        renderItem={(u) => {
          const isSelf = u.id === user.id
          const isLastAdmin = u.roles.includes('admin') && adminCount <= 1
          return (
            <div className={cx(cardBase, 'flex flex-col gap-2')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-text-h">{u.fullName}</span>
                <span className="flex flex-wrap gap-1">
                  {u.roles.map((r) => (
                    <span
                      key={r}
                      className="w-fit rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] capitalize text-text"
                    >
                      {formatRole(r)}
                    </span>
                  ))}
                </span>
              </div>
              <p className="text-[13px] text-text">
                {u.email}
                {u.isFounder && ' · Clinic founder — always keeps the admin role'}
              </p>

              {resettingPasswordFor === u.id && (
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
              )}

              {editingRolesFor === u.id && (
                <form className="flex flex-wrap items-end gap-2.5" onSubmit={submitEditRoles}>
                  <RoleCheckboxes
                    value={editingRoles}
                    onChange={setEditingRoles}
                    disabledValues={u.isFounder ? ['admin'] : []}
                  />
                  <Button type="submit" variant="secondary">
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingRolesFor(null)
                      setEditRolesError(null)
                    }}
                  >
                    Cancel
                  </Button>
                  {editRolesError && <p className="w-full text-[13px] text-high">{editRolesError}</p>}
                </form>
              )}

              {resettingPasswordFor !== u.id && editingRolesFor !== u.id && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingRolesFor(u.id)
                      setEditingRoles(u.roles)
                      setEditRolesError(null)
                    }}
                  >
                    Edit roles
                  </Button>
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
            </div>
          )
        }}
      />

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
    </Screen>
  )
}
