import { useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { TextInput } from './TextInput'
import { fieldLabel, fieldLabelText } from '../../styles'

function FilterIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2.2" fill="currentColor" stroke="none" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="16" cy="17" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

interface FilterConfig {
  /** Shows a small accent dot on the icon when a non-default filter/sort is set. */
  active: boolean
  /** Popover contents — whatever filter/sort controls this screen needs. */
  content: ReactNode
  /** aria-label for the icon button and its close backdrop. Defaults to "Filter and sort". */
  label?: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Visible caption above the field. Defaults to "Search". */
  label?: string
  /** Omit entirely for a plain search box with no filter icon/popover. */
  filter?: FilterConfig
}

/**
 * The one place every search box in the app renders through. Filtering is
 * opt-in via the `filter` prop: when present, a "sliders" icon appears next
 * to the input, opening a popover with arbitrary filter/sort controls.
 * Omit `filter` for a plain search box.
 *
 * The icon is sized off the input itself (flex stretch + aspect-square)
 * rather than a second hard-coded height, so it can't drift out of
 * alignment with the input the way two independently-set heights can.
 */
export function SearchBox({ value, onChange, placeholder, label = 'Search', filter }: Props) {
  const [filterOpen, setFilterOpen] = useState(false)
  const filterLabel = filter?.label ?? 'Filter and sort'

  return (
    <div className={fieldLabel}>
      <span className={fieldLabelText}>{label}</span>
      <div className="flex gap-2">
        <TextInput
          type="search"
          className="flex-1"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {filter && (
          <div className="relative shrink-0">
            <Button
              variant="unstyled"
              className="flex aspect-square h-full items-center justify-center rounded-[10px] border border-border bg-bg text-text-h cursor-pointer"
              aria-label={filterLabel}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <FilterIcon />
            </Button>
            {filter.active && (
              <span className="pointer-events-none absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent" />
            )}

            {filterOpen && (
              <>
                <Button
                  variant="unstyled"
                  className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
                  aria-label={`Close ${filterLabel.toLowerCase()}`}
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 flex w-60 flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-card">
                  {filter.content}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
