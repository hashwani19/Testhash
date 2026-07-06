import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './Button'
import { card, fieldInput, fieldLabel, fieldLabelText, pageTitle } from '../styles'

export function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!login(email, password)) {
      setError(true)
      return
    }
    setError(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-5">
      <form className={`${card} flex w-full max-w-[360px] flex-col gap-3.5`} onSubmit={submit}>
        <h1 className={pageTitle}>Ortho and Vision Care</h1>
        <p className="text-sm text-text">Sign in to continue</p>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Email</span>
          <input
            type="email"
            className={fieldInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Password</span>
          <input
            type="password"
            className={fieldInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="text-[13px] text-high">Incorrect email or password.</p>}

        <Button type="submit" variant="primary" fullWidth>
          Sign in
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
