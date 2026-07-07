import { forwardRef } from 'react'
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
  icon: 'inline-flex h-7 w-7 items-center justify-center rounded-lg border-none bg-transparent text-text text-xl leading-none cursor-pointer',
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
 * button dropped inside a <form> never accidentally submits it. Forwards
 * `ref` to the underlying `<button>` — needed anywhere a caller has to
 * imperatively focus a specific button (e.g. PrescriptionPrint restoring
 * focus to a real, visible control after the OS print UI closes).
 */
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'unstyled', fullWidth, type = 'button', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(VARIANT_CLASSES[variant], fullWidth && 'w-full', className)}
      {...rest}
    />
  )
})
