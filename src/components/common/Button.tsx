import type { ButtonHTMLAttributes } from 'react'
import { cx } from '../../styles'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'link'
  | 'icon'
  | 'iconCircle'
  | 'unstyled'

const actionBase =
  'rounded-[10px] px-[18px] py-2.5 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-default'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `${actionBase} bg-accent text-accent-contrast`,
  secondary: `${actionBase} bg-bg text-text-h border border-border`,
  danger: `${actionBase} bg-transparent text-high border border-high`,
  ghost:
    'rounded-lg px-3 py-1.5 text-[13px] font-semibold bg-accent text-accent-contrast whitespace-nowrap cursor-pointer',
  link: 'bg-transparent border-none text-text underline text-[13px] self-start py-2 cursor-pointer',
  icon: 'bg-transparent border-none text-text text-xl leading-none cursor-pointer px-2 py-1',
  iconCircle: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer',
  unstyled: '',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Named visual style. Use 'unstyled' (default) plus `className` for one-off looks. */
  variant?: ButtonVariant
  fullWidth?: boolean
}

/**
 * The one place every clickable <button> in the app goes through. Native
 * button props (onClick, disabled, aria-label, autoFocus, ...) pass straight
 * through — `variant`/`fullWidth` cover the shared visual styles, and
 * `className` covers anything one-off. Defaults `type` to "button" so a
 * button dropped inside a <form> never accidentally submits it.
 */
export function Button({ variant = 'unstyled', fullWidth, type = 'button', className, ...rest }: Props) {
  return (
    <button type={type} className={cx(VARIANT_CLASSES[variant], fullWidth && 'w-full', className)} {...rest} />
  )
}
