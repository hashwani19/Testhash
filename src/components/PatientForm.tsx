import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Gender, Patient, PatientGroup } from '../types'
import type { PatientInput } from '../hooks/usePatients'
import { computeAgeFromDob } from '../utils/age'
import { btnPrimary, btnSecondary, card, fieldInput, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  initial?: Patient
  groups: PatientGroup[]
  onSubmit: (input: PatientInput) => void
  onCancel: () => void
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'unspecified', label: 'Prefer not to say' },
]

export function PatientForm({ initial, groups, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dob, setDob] = useState(initial?.dob ?? '')
  const [manualAge, setManualAge] = useState(
    initial?.manualAge != null ? String(initial.manualAge) : '',
  )
  const [address, setAddress] = useState(initial?.address ?? '')
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'unspecified')
  const [groupId, setGroupId] = useState(initial?.groupId ?? '')

  const computedAge = dob ? computeAgeFromDob(dob) : undefined

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onSubmit({
      name: trimmedName,
      dob: dob || undefined,
      manualAge: manualAge ? Number(manualAge) : undefined,
      address,
      gender,
      groupId: groupId || undefined,
    })
  }

  return (
    <form className={`${card} flex flex-col gap-3.5`} onSubmit={submit}>
      <label className={fieldLabel}>
        <span className={fieldLabelText}>Name</span>
        <input
          type="text"
          className={fieldInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
        />
      </label>

      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Date of birth</span>
          <input
            type="date"
            className={fieldInput}
            value={dob}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDob(e.target.value)}
          />
        </label>

        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Age {dob ? '(from DOB)' : ''}</span>
          <input
            type="number"
            className={fieldInput}
            inputMode="numeric"
            min={0}
            max={130}
            step={1}
            value={dob ? (computedAge ?? '') : manualAge}
            onChange={(e) => setManualAge(e.target.value)}
            disabled={Boolean(dob)}
            placeholder="Age"
          />
        </label>
      </div>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Gender</span>
        <select
          className={fieldInput}
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Group</span>
        <select className={fieldInput} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldLabel}>
        <span className={fieldLabelText}>Address</span>
        <textarea
          className={fieldInput}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, city, postal code"
          rows={2}
        />
      </label>

      <div className="flex justify-end gap-2.5">
        <button type="button" className={btnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={!name.trim()}>
          {initial ? 'Save changes' : 'Add patient'}
        </button>
      </div>
    </form>
  )
}
