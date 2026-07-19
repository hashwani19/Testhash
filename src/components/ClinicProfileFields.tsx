import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ClinicType } from '../types'
import { CLINIC_TYPE_OPTIONS } from '../clinicTypes'
import { compressLogoFile } from '../utils/imageCompression'
import type { ClinicProfileValue } from '../utils/clinicProfile'
import { TextInput } from './common/TextInput'
import { Textarea } from './common/Textarea'
import { Select } from './common/Select'
import { Button } from './common/Button'
import { fieldLabel, fieldLabelText } from '../styles'

interface Props {
  value: ClinicProfileValue
  onChange: (value: ClinicProfileValue) => void
}

/**
 * Mandatory clinic mobile number + clinic type, plus the optional fields
 * that only shape the printed prescription letterhead (§5.6 of
 * docs/design.md) — shared by self-signup and superuser tenant
 * provisioning (§5.5), and the exact same set of fields a tenant admin
 * later edits from Preferences.
 */
export function ClinicProfileFields({ value, onChange }: Props) {
  const [compressingLogo, setCompressingLogo] = useState(false)

  const set = <K extends keyof ClinicProfileValue>(key: K, v: ClinicProfileValue[K]) =>
    onChange({ ...value, [key]: v })

  const handleLogoSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCompressingLogo(true)
    try {
      const compressed = await compressLogoFile(file)
      set('logoDataUrl', compressed.dataUrl)
    } finally {
      setCompressingLogo(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3.5 md:flex-row md:gap-2.5">
        <label className={fieldLabel}>
          <span className={fieldLabelText}>Mobile number</span>
          <TextInput
            type="tel"
            inputMode="numeric"
            value={value.mobile}
            onChange={(e) => set('mobile', e.target.value)}
            placeholder="10-digit mobile number"
            pattern="[6-9][0-9]{9}"
            title="10-digit Indian mobile number"
            required
          />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Clinic type</span>
          <Select value={value.clinicType} onChange={(e) => set('clinicType', e.target.value as ClinicType)}>
            {CLINIC_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <p className="text-[13px] text-text">
        Everything below is optional and only shapes how your printed prescriptions look — you can skip it
        now and fill it in later from Preferences.
      </p>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Clinic name (optional)</span>
        <TextInput
          value={value.clinicName}
          onChange={(e) => set('clinicName', e.target.value)}
          placeholder="Printed in the prescription header"
        />
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Clinic address (optional)</span>
        <Textarea value={value.clinicAddress} onChange={(e) => set('clinicAddress', e.target.value)} rows={2} />
      </label>

      <div className="flex flex-col gap-3.5 md:flex-row md:gap-2.5">
        <label className={fieldLabel}>
          <span className={fieldLabelText}>Doctor's name (optional)</span>
          <TextInput
            value={value.doctorName}
            onChange={(e) => set('doctorName', e.target.value)}
            placeholder="e.g. Dr. Priya Sharma"
          />
        </label>

        <label className={fieldLabel}>
          <span className={fieldLabelText}>Doctor's credentials (optional)</span>
          <TextInput
            value={value.doctorCredentials}
            onChange={(e) => set('doctorCredentials', e.target.value)}
            placeholder="e.g. M.B.B.S., M.S."
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className={fieldLabelText}>Logo (optional)</span>
        {value.logoDataUrl && (
          <img
            src={value.logoDataUrl}
            alt="Logo preview"
            className="h-16 w-16 rounded-lg border border-border object-contain bg-bg p-1"
          />
        )}
        <div className="flex flex-wrap gap-2.5">
          <div className="relative w-fit">
            <Button variant="secondary" disabled={compressingLogo}>
              {compressingLogo ? 'Processing…' : value.logoDataUrl ? 'Replace logo' : 'Add logo'}
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
          {value.logoDataUrl && (
            <Button variant="secondary" onClick={() => set('logoDataUrl', '')}>
              Remove logo
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
