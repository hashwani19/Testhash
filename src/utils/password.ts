/** Same rule enforced client-side wherever a password is set — self-signup,
 *  superuser tenant provisioning, and a tenant admin's Users screen. */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password)
}

export const PASSWORD_HINT = 'At least 8 characters, including a letter and a number.'
