import type { ThemePreference } from '../types'
import { usePreferences } from '../hooks/usePreferences'
import { DEFAULT_LIST_PAGE_SIZE } from './common/ListView'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Select } from './common/Select'
import { card, screenHeading, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  onBack: () => void
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'auto', label: 'Auto (match device)' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function PreferencesScreen({ onBack }: Props) {
  const { preferences, updatePreferences } = usePreferences()

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" onClick={onBack}>
        ‹ All patients
      </Button>

      <h2 className={screenHeading}>Preferences</h2>

      <div className={`${card} flex flex-col gap-3.5`}>
        <label className={fieldLabel}>
          <span className={fieldLabelText}>Theme</span>
          <Select
            value={preferences.theme}
            onChange={(e) => updatePreferences({ theme: e.target.value as ThemePreference })}
          >
            {THEME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Items per page in lists</span>
          <TextInput
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={preferences.listPageSize ?? ''}
            placeholder={`${DEFAULT_LIST_PAGE_SIZE} (default)`}
            onChange={(e) => {
              const raw = e.target.value
              updatePreferences({ listPageSize: raw ? Number(raw) : undefined })
            }}
          />
        </label>
      </div>
    </div>
  )
}
