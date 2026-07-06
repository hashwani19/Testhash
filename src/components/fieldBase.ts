// Shared styling for every text-entry surface (TextInput, Textarea, Select).
// font-size is a hard-coded 16px — not Tailwind's rem-based `text-base` —
// so it can never end up under the ~16px threshold that makes iOS Safari
// zoom the whole page in when the field receives focus, regardless of any
// ancestor's font-size or the user's browser text-size setting.
export const fieldBase =
  'min-w-0 rounded-[10px] border border-border bg-bg px-3 py-2.5 text-text-h text-[16px] leading-normal font-[inherit] ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 ' +
  'disabled:opacity-60'
