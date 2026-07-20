import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Role } from '../types'
import { useAuth } from '../hooks/useAuth'
import { PASSWORD_HINT, isStrongPassword } from '../utils/password'
import { RoleCheckboxes } from './RoleCheckboxes'
import { FormCard } from './common/FormCard'
import { TextInput } from './common/TextInput'
import { fieldLabel, fieldLabelText } from '../styles'

interface Props {
  onDone: () => void
  onCancel: () => void
}

const DEFAULT_ROLES: Role[] = ['front_desk']

/** Tenant-admin's "Add user" form (§8 of docs/design.md) — `createUser`
 *  always targets the caller's own tenant (AuthContext), so there's no
 *  tenant id to thread through here. */
export function UserForm({ onDone, onCancel }: Props) {
  const { createUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isDirty =
    fullName !== '' ||
    email !== '' ||
    password !== '' ||
    JSON.stringify(roles) !== JSON.stringify(DEFAULT_ROLES)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (roles.length === 0) {
      setError('Pick at least one role.')
      return
    }
    if (!isStrongPassword(password)) {
      setError(PASSWORD_HINT)
      return
    }
    const result = createUser({ email, password, fullName, roles })
    if (!result.ok) {
      setError(
        result.error === 'duplicate_email'
          ? 'An account with this email already exists.'
          : result.error === 'forbidden'
            ? "You don't have permission to do this."
            : PASSWORD_HINT,
      )
      return
    }
    onDone()
  }

  return (
    <FormCard
      title="Add user"
      onCancel={onCancel}
      onSubmit={submit}
      submitLabel="Add user"
      isDirty={isDirty}
      discardTitle="Discard this new user?"
    >
      <label className={fieldLabel}>
        <span className={fieldLabelText}>Full name</span>
        <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </label>

      <fieldset className={fieldLabel}>
        <legend className={fieldLabelText}>Roles</legend>
        <RoleCheckboxes value={roles} onChange={setRoles} />
      </fieldset>

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

      {error && <p className="text-[13px] text-high">{error}</p>}
    </FormCard>
  )
}
