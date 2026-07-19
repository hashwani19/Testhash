import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ClinicType, ThemePreference } from '../types'
import { usePreferences } from '../hooks/usePreferences'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { usePrescriptionTemplate } from '../hooks/usePrescriptionTemplate'
import { useAuth } from '../hooks/useAuth'
import { compressLogoFile } from '../utils/imageCompression'
import { CLINIC_TYPE_OPTIONS } from '../clinicTypes'
import { DEFAULT_LIST_PAGE_SIZE } from './common/ListView'
import { TextInput } from './common/TextInput'
import { Textarea } from './common/Textarea'
import { Select } from './common/Select'
import { Button } from './common/Button'
import { Breadcrumb } from './common/Breadcrumb'
import { card, narrowContent, screenHeading, fieldLabel, fieldLabelText } from '../styles'

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
  const { user, tenants, updateTenantProfile } = useAuth()
  const { settings, updateSettings } = useGlobalSettings()
  const { template, updateTemplate } = usePrescriptionTemplate()
  const [compressingLogo, setCompressingLogo] = useState(false)
  const tenant = tenants.find((t) => t.id === user?.tenantId)

  const handleLogoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCompressingLogo(true)
    try {
      const compressed = await compressLogoFile(file)
      updateTemplate({ logoDataUrl: compressed.dataUrl })
    } finally {
      setCompressingLogo(false)
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${narrowContent}`}>
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

      {tenant && (
        <>
          <h3 className="text-base font-bold text-text-h">Clinic profile (admin only)</h3>
          <div className={`${card} flex flex-col gap-3.5`}>
            <label className={fieldLabel}>
              <span className={fieldLabelText}>Mobile number</span>
              <TextInput
                type="tel"
                inputMode="numeric"
                value={tenant.mobile}
                onChange={(e) => updateTenantProfile(tenant.id, { mobile: e.target.value })}
                pattern="[6-9][0-9]{9}"
                title="10-digit Indian mobile number"
              />
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Clinic type</span>
              <Select
                value={tenant.clinicType}
                onChange={(e) => updateTenantProfile(tenant.id, { clinicType: e.target.value as ClinicType })}
              >
                {CLINIC_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

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
              <span className={fieldLabelText}>Clinic name</span>
              <TextInput
                value={template.clinicName ?? ''}
                onChange={(e) => updateTemplate({ clinicName: e.target.value || undefined })}
                placeholder="Ortho and Vision Care (default)"
              />
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Clinic address (optional)</span>
              <Textarea
                value={template.clinicAddress ?? ''}
                onChange={(e) => updateTemplate({ clinicAddress: e.target.value || undefined })}
                rows={2}
                placeholder="Printed under the clinic name in the header"
              />
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Doctor's name (optional)</span>
              <TextInput
                value={template.doctorName ?? ''}
                onChange={(e) => updateTemplate({ doctorName: e.target.value || undefined })}
                placeholder="e.g. Dr. Priya Sharma"
              />
            </label>

            <label className={fieldLabel}>
              <span className={fieldLabelText}>Doctor's credentials (optional)</span>
              <Textarea
                value={template.doctorCredentials ?? ''}
                onChange={(e) => updateTemplate({ doctorCredentials: e.target.value || undefined })}
                rows={2}
                placeholder={'e.g. M.B.B.S., M.S.\nF.C.L.I., F.I.A.C.L.E. (Aust.)'}
              />
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

            <div className="flex flex-col gap-2">
              <span className={fieldLabelText}>Logo (optional)</span>
              {template.logoDataUrl && (
                <img
                  src={template.logoDataUrl}
                  alt="Current logo"
                  className="h-16 w-16 rounded-lg border border-border object-contain bg-bg p-1"
                />
              )}
              <div className="flex flex-wrap gap-2.5">
                <div className="relative w-fit">
                  <Button variant="secondary" disabled={compressingLogo}>
                    {compressingLogo ? 'Processing…' : template.logoDataUrl ? 'Replace logo' : 'Add logo'}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={compressingLogo}
                    onChange={handleLogoSelected}
                    className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-default"
                    aria-label="Add logo"
                  />
                </div>
                {template.logoDataUrl && (
                  <Button variant="secondary" onClick={() => updateTemplate({ logoDataUrl: undefined })}>
                    Remove logo
                  </Button>
                )}
              </div>
              <p className="text-[13px] text-text">
                Printed as a small icon next to the clinic name in the letterhead header.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
