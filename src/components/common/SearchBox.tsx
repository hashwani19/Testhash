import type { ReactNode } from 'react'
import { Button } from './Button'
import { TextInput } from './TextInput'
import { Dropdown } from './Dropdown'
import { FilterIcon } from './icons'
import { fieldLabel, fieldLabelText } from '../../styles'

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
 * to the input, opening a Dropdown popover with arbitrary filter/sort
 * controls. Omit `filter` for a plain search box.
 *
 * The icon button is a fixed 44px (h-11 w-11) square, matched by giving the
 * input an explicit h-11 too — both come from the same literal Tailwind
 * class rather than trying to derive one from the other. (An earlier
 * version used flex-stretch + aspect-square to size the button off the
 * input dynamically; that combination has real Chromium layout bugs — it
 * either overflowed the row or collapsed the button to a couple of pixels
 * wide depending on exactly how it was wired up. A fixed size everyone
 * calls the same class for is simpler and actually reliable.)
 */
export function SearchBox({ value, onChange, placeholder, label = 'Search', filter }: Props) {
  const filterLabel = filter?.label ?? 'Filter and sort'

  return (
    <div className={fieldLabel}>
      <span className={fieldLabelText}>{label}</span>
      <div className="flex gap-2">
        <TextInput
          type="search"
          className="h-11 flex-1"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {filter && (
          <Dropdown
            align="right"
            wrapperClassName="h-11 w-11"
            widthClassName="w-60"
            panelClassName="gap-3 p-3.5"
            closeLabel={`Close ${filterLabel.toLowerCase()}`}
            trigger={({ onClick }) => (
              <>
                <Button
                  variant="unstyled"
                  className="absolute inset-0 flex items-center justify-center rounded-[10px] border border-border bg-bg text-text-h cursor-pointer"
                  aria-label={filterLabel}
                  onClick={onClick}
                >
                  <FilterIcon />
                </Button>
                {filter.active && (
                  <span className="pointer-events-none absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent" />
                )}
              </>
            )}
          >
            {() => filter.content}
          </Dropdown>
        )}
      </div>
    </div>
  )
}
