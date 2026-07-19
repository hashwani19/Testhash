import { useState } from 'react'
import { LoginScreen } from './LoginScreen'
import { SignUpScreen } from './SignUpScreen'

/** Toggles between sign-in and self-service signup (§5.5 of
 *  docs/design.md) for the signed-out state — a successful signup logs
 *  the new admin straight in, so there's no separate confirmation step. */
export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  return mode === 'login' ? (
    <LoginScreen onSignUp={() => setMode('signup')} />
  ) : (
    <SignUpScreen onCancel={() => setMode('login')} />
  )
}
