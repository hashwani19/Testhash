import type { SelectHTMLAttributes } from 'react'
import { fieldBase } from './fieldBase'
import { cx } from '../styles'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {}

/** The one place every <select> dropdown in the app renders through. */
export function Select({ className, ...rest }: Props) {
  return <select className={cx(fieldBase, className)} {...rest} />
}
