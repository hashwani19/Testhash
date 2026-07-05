import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

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
    <div className="login-screen">
      <form className="panel-form login-form" onSubmit={submit}>
        <h1>Eye Care Records</h1>
        <p className="subtitle">Sign in to continue</p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="form-error">Incorrect email or password.</p>}

        <button type="submit" className="btn-primary btn-block">
          Sign in
        </button>

        <div className="login-hint">
          <p>Test accounts (local-storage only, not secure):</p>
          <ul>
            <li>admin@example.com / admin123</li>
            <li>doctor@example.com / doctor123</li>
            <li>frontdesk@example.com / frontdesk123</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
