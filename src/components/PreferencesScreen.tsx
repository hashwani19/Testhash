import type { ThemePreference } from '../types'
import { usePreferences } from '../hooks/usePreferences'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { usePrescriptionTemplate } from '../hooks/usePrescriptionTemplate'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_LIST_PAGE_SIZE } from './common/ListView'
import { TextInput } from './common/TextInput'
import { Textarea } from './common/Textarea'
import { Select } from './common/Select'
import { Breadcrumb } from './common/Breadcrumb'
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
  const { user } = useAuth()
  const { settings, updateSettings } = useGlobalSettings()
  const { template, updateTemplate } = usePrescriptionTemplate()

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb onClick={onBack} />

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

      {user?.role === 'admin' && (
        <>
          <h3 className="text-base font-bold text-text-h">App settings (admin only)</h3>
          <div className={`${card} flex flex-col gap-3.5`}>
            <label className="flex items-center gap-2 text-[15px] text-text-h">
              <input
                type="checkbox"
                className="accent-accent"
                checked={settings.autoDeleteOldAppointments}
                onChange={(e) => updateSettings({ autoDeleteOldAppointments: e.target.checked })}
              />
              Automatically delete old appointments
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Delete appointments older than (days)</span>
              <TextInput
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={settings.autoDeleteAfterDays}
                disabled={!settings.autoDeleteOldAppointments}
                onChange={(e) =>
                  updateSettings({ autoDeleteAfterDays: Number(e.target.value) || 2 })
                }
              />
            </label>
          </div>

          <h3 className="text-base font-bold text-text-h">Prescription template (admin only)</h3>
          <div className={`${card} flex flex-col gap-3.5`}>
            <label className="flex items-center gap-2 text-[15px] text-text-h">
              <input
                type="checkbox"
                className="accent-accent"
                checked={template.showLetterhead}
                onChange={(e) => updateTemplate({ showLetterhead: e.target.checked })}
              />
              Show clinic name on printed prescriptions
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>
                Extra top margin (mm){' '}
                {!template.showLetterhead && '— for pre-printed letterhead paper'}
              </span>
              <TextInput
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={template.topMarginMm}
                onChange={(e) => updateTemplate({ topMarginMm: Number(e.target.value) || 0 })}
              />
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Footer note (optional)</span>
              <Textarea
                value={template.footerNote ?? ''}
                onChange={(e) => updateTemplate({ footerNote: e.target.value || undefined })}
                rows={2}
                placeholder="Address, phone, or a disclaimer printed at the bottom of every prescription"
              />
            </label>
          </div>
        </>
      )}
    </div>
  )
}
