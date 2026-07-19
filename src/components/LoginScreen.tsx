import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { card, fieldLabel, fieldLabelText, pageTitle } from '../styles'

interface Props {
  onSignUp: () => void
}

export function LoginScreen({ onSignUp }: Props) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(
        result.error === 'suspended'
          ? 'This clinic account has been suspended. Contact your administrator.'
          : 'Incorrect email or password.',
      )
      return
    }
    setError(null)
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-5">
      <form className={`${card} flex w-full max-w-[360px] flex-col gap-3.5`} onSubmit={submit}>
        <h1 className={pageTitle}>Ortho and Vision Care</h1>
        <p className="text-sm text-text">Sign in to continue</p>

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

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Password</span>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="text-[13px] text-high">{error}</p>}

        <Button type="submit" variant="primary" fullWidth>
          Sign in
        </Button>

        <Button variant="link" onClick={onSignUp}>
          New clinic? Sign up
        </Button>

        <div className="border-t border-border pt-3 text-xs text-text">
          <p>Test accounts (local-storage only, not secure):</p>
          <ul className="mt-1.5 list-disc pl-4">
            <li>admin@example.com / admin123</li>
            <li>doctor@example.com / doctor123</li>
            <li>frontdesk@example.com / frontdesk123</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
