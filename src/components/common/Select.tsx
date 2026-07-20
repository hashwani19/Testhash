import type { SelectHTMLAttributes } from 'react'
import { fieldBase } from './fieldBase'
import { ChevronDownIcon } from './icons'
import { cx } from '../../styles'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * The one place every <select> dropdown in the app renders through —
 * fixing its look here (rather than per-screen) means every dropdown in
 * the app (Theme, Gender, Group, every filter/sort select, Clinic type, ...)
 * stays visually consistent by construction. `appearance-none` strips the
 * browser's own native arrow, which renders differently per browser/OS and
 * never quite matches the rest of the field styling, in favor of one
 * chevron drawn the same way as every other icon in the app.
 */
export function Select({ className, ...rest }: Props) {
  return (
    <div className="relative">
      <select className={cx(fieldBase, 'peer w-full appearance-none pr-9', className)} {...rest} />
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text peer-disabled:opacity-60" />
    </div>
  )
}
