import type { SVGProps } from 'react'

/** Disclosure chevron drawn for every `<Select>` in the app, replacing the
 *  browser's own native dropdown arrow (which renders inconsistently
 *  across browsers/OSes and never matches the rest of the field styling). */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
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
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
