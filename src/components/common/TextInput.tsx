import type { InputHTMLAttributes } from 'react'
import { fieldBase } from './fieldBase'
import { cx } from '../../styles'

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * The one place every single-line <input> in the app renders through
 * (text, email, password, search, number, date, datetime-local, ...).
 * Native input props pass straight through; `className` extends the shared
 * field look for one-off sizing.
 */
export function TextInput({ className, ...rest }: Props) {
  return <input className={cx(fieldBase, className)} {...rest} />
}
