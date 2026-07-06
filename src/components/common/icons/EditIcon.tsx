import type { SVGProps } from 'react'

/**
 * Pencil "edit" icon used everywhere an edit action needs an icon rather
 * than a text button. Color is configurable via `className` (the stroke
 * uses currentColor) — defaults to the accent blue tinge; pass a different
 * text-color class to override it.
 */
export function EditIcon({ className = 'text-accent', ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}
