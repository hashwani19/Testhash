import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Gender, Patient } from '../types'
import type { PatientInput } from '../hooks/usePatients'
import { computeAgeFromDob } from '../utils/age'

interface Props {
  initial?: Patient
  onSubmit: (input: PatientInput) => void
  onCancel: () => void
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'unspecified', label: 'Prefer not to say' },
]

export function PatientForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dob, setDob] = useState(initial?.dob ?? '')
  const [manualAge, setManualAge] = useState(
    initial?.manualAge != null ? String(initial.manualAge) : '',
  )
  const [address, setAddress] = useState(initial?.address ?? '')
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'unspecified')

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
    })
  }

  return (
    <form className="panel-form" onSubmit={submit}>
      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Date of birth</span>
          <input
            type="date"
            value={dob}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDob(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Age {dob ? '(from DOB)' : ''}</span>
          <input
            type="number"
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

      <label className="field">
        <span>Gender</span>
        <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Address</span>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, city, postal code"
          rows={2}
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!name.trim()}>
          {initial ? 'Save changes' : 'Add patient'}
        </button>
      </div>
    </form>
  )
}
