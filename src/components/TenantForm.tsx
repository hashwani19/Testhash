import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PASSWORD_HINT, isStrongPassword } from '../utils/password'
import { ClinicProfileFields } from './ClinicProfileFields'
import { EMPTY_CLINIC_PROFILE } from '../utils/clinicProfile'
import type { ClinicProfileValue } from '../utils/clinicProfile'
import { FormCard } from './common/FormCard'
import { TextInput } from './common/TextInput'
import { fieldLabel, fieldLabelText } from '../styles'

interface Props {
  onDone: () => void
  onCancel: () => void
}

/** Superuser's "Add tenant" form (§5.4/§5.5 of docs/design.md) — the same
 *  fields as self-signup (§1 of the original spec), submitted through
 *  `addTenant` rather than `signUp` since the caller isn't the new
 *  tenant's own admin and shouldn't be signed into it. */
export function TenantForm({ onDone, onCancel }: Props) {
  const { addTenant } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [profile, setProfile] = useState<ClinicProfileValue>(EMPTY_CLINIC_PROFILE)
  const [error, setError] = useState<string | null>(null)

  const isDirty =
    email !== '' ||
    password !== '' ||
    repeatPassword !== '' ||
    JSON.stringify(profile) !== JSON.stringify(EMPTY_CLINIC_PROFILE)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (password !== repeatPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!isStrongPassword(password)) {
      setError(PASSWORD_HINT)
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
      setError(
        result.error === 'duplicate_email' ? 'An account with this email already exists.' : PASSWORD_HINT,
      )
      return
    }
    onDone()
  }

  return (
    <FormCard
      title="New clinic"
      onCancel={onCancel}
      onSubmit={submit}
      submitLabel="Create tenant"
      isDirty={isDirty}
      discardTitle="Discard this new clinic?"
    >
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

      {error && <p className="text-[13px] text-high">{error}</p>}
    </FormCard>
  )
}
