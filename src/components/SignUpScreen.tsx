import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PASSWORD_HINT, isStrongPassword } from '../utils/password'
import { ClinicProfileFields } from './ClinicProfileFields'
import { EMPTY_CLINIC_PROFILE } from '../utils/clinicProfile'
import type { ClinicProfileValue } from '../utils/clinicProfile'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { card, fieldLabel, fieldLabelText, pageTitle } from '../styles'

interface Props {
  onCancel: () => void
}

/** Self-service tenant signup (§5.5 of docs/design.md) — the signed-up
 *  account becomes that tenant's first `admin`. Auto-signs in on success,
 *  so there's no separate "done" step to wire up. */
export function SignUpScreen({ onCancel }: Props) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [profile, setProfile] = useState<ClinicProfileValue>(EMPTY_CLINIC_PROFILE)
  const [error, setError] = useState<string | null>(null)

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
    const result = signUp({
      email,
      password,
      mobile: profile.mobile,
      clinicType: profile.clinicType,
      clinicName: profile.clinicName,
      clinicAddress: profile.clinicAddress || undefined,
      doctorName: profile.doctorName || undefined,
      doctorCredentials: profile.doctorCredentials || undefined,
      logoDataUrl: profile.logoDataUrl || undefined,
    })
    if (!result.ok) {
      setError(
        result.error === 'duplicate_email'
          ? 'An account with this email already exists.'
          : result.error === 'missing_clinic_name'
            ? 'Clinic name is required.'
            : PASSWORD_HINT,
      )
      return
    }
    setError(null)
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-5">
      <form className={`${card} flex w-full max-w-[420px] flex-col gap-3.5`} onSubmit={submit}>
        <h1 className={pageTitle}>Set up your clinic</h1>
        <p className="text-sm text-text">Creates a new, independent clinic account.</p>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Email</span>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <div className="flex flex-col gap-3.5 md:flex-row md:gap-2.5">
          <label className={fieldLabel}>
            <span className={fieldLabelText}>Password</span>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
              autoComplete="new-password"
              required
            />
          </label>
        </div>
        <p className="text-[13px] text-text">{PASSWORD_HINT}</p>

        <ClinicProfileFields value={profile} onChange={setProfile} />

        {error && <p className="text-[13px] text-high">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create clinic account
          </Button>
        </div>
      </form>
    </div>
  )
}
