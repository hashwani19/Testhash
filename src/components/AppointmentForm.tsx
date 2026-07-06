import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Patient } from '../types'
import type { AppointmentInput } from '../hooks/useAppointments'
import { computeAgeFromDob } from '../utils/age'
import { MIN_SEARCH_LENGTH } from '../utils/patientQuery'
import { todayDateOnly } from '../utils/date'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { card, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  patients: Patient[]
  onSubmit: (input: AppointmentInput) => void
  onCancel: () => void
}

/** 'search' — looking a patient up; 'existing'/'new' — resolved by that
 *  lookup, not chosen directly (there's no existing/new toggle, §see below). */
type PatientMode = 'search' | 'existing' | 'new'

export function AppointmentForm({ patients, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(todayDateOnly())
  const [time, setTime] = useState('')
  const [mode, setMode] = useState<PatientMode>('search')

  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [manualAge, setManualAge] = useState('')
  const [mobile, setMobile] = useState('')
  const [address, setAddress] = useState('')

  const computedAge = dob ? computeAgeFromDob(dob) : undefined
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) ?? null

  const matches = useMemo(() => {
    const q = patientSearch.trim().toLowerCase()
    if (q.length < MIN_SEARCH_LENGTH) return []
    return patients
      .filter((p) => p.name.toLowerCase().includes(q) || p.patientNumber.toLowerCase().includes(q))
      .slice(0, 8)
  }, [patients, patientSearch])

  const backToSearch = () => {
    setMode('search')
    setSelectedPatientId('')
    setName('')
    setDob('')
    setManualAge('')
    setMobile('')
    setAddress('')
  }

  const canSubmit =
    date >= todayDateOnly() &&
    (mode === 'existing' ? selectedPatientId !== '' : mode === 'new' ? name.trim() !== '' : false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      date,
      time: time || undefined,
      patientId: mode === 'existing' ? selectedPatientId : undefined,
      newPatient:
        mode === 'new'
          ? {
              name: name.trim(),
              dob: dob || undefined,
              manualAge: dob ? undefined : manualAge ? Number(manualAge) : undefined,
              mobile: mobile || undefined,
              address: address || undefined,
            }
          : undefined,
    })
  }

  return (
    <form className={`${card} flex flex-col gap-3.5`} onSubmit={submit}>
      {mode === 'search' && (
        <label className={fieldLabel}>
          <span className={fieldLabelText}>Patient (name or number)</span>
          <TextInput
            type="search"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder={`Name or number (${MIN_SEARCH_LENGTH}+ chars)`}
            autoFocus
          />

          {matches.length > 0 && (
            <ul className="flex flex-col gap-1.5 pt-1">
              {matches.map((p) => (
                <li key={p.id}>
                  <Button
                    variant="unstyled"
                    className="flex w-full flex-col rounded-lg border border-border bg-bg px-3 py-2 text-left cursor-pointer"
                    onClick={() => {
                      setMode('existing')
                      setSelectedPatientId(p.id)
                      setPatientSearch('')
                    }}
                  >
                    <span className="font-semibold text-text-h">{p.name}</span>
                    <span className="text-[13px] text-text">{p.patientNumber}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {patientSearch.trim() !== '' && (
            <Button
              variant="secondary"
              className="mt-1 self-start"
              onClick={() => {
                setMode('new')
                setName(patientSearch.trim())
                setPatientSearch('')
              }}
            >
              Add &quot;{patientSearch.trim()}&quot; as a new patient
            </Button>
          )}
        </label>
      )}

      {mode === 'existing' && selectedPatient && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-bg px-3 py-2.5">
          <div>
            <p className="font-semibold text-text-h">{selectedPatient.name}</p>
            <p className="text-[13px] text-text">{selectedPatient.patientNumber}</p>
          </div>
          <Button variant="link" onClick={backToSearch}>
            Change
          </Button>
        </div>
      )}

      {mode === 'new' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-text-h">New patient</span>
            <Button variant="link" onClick={backToSearch}>
              Change
            </Button>
          </div>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Name</span>
            <TextInput
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </label>

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Mobile number</span>
            <TextInput
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
              pattern="[6-9][0-9]{9}"
              title="10-digit Indian mobile number"
            />
          </label>

          <div className="flex flex-wrap gap-2.5">
            <label className={`${fieldLabel} min-w-[90px]`}>
              <span className={fieldLabelText}>Date of birth</span>
              <TextInput
                type="date"
                value={dob}
                max={todayDateOnly()}
                onChange={(e) => setDob(e.target.value)}
              />
            </label>

            <label className={`${fieldLabel} min-w-[90px]`}>
              <span className={fieldLabelText}>Age {dob ? '(from DOB)' : ''}</span>
              <TextInput
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

          <label className={fieldLabel}>
            <span className={fieldLabelText}>Address</span>
            <TextInput
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, postal code"
            />
          </label>
        </>
      )}

      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[130px]`}>
          <span className={fieldLabelText}>Date</span>
          <TextInput
            type="date"
            value={date}
            min={todayDateOnly()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label className={`${fieldLabel} min-w-[100px]`}>
          <span className={fieldLabelText}>Time (optional)</span>
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>

      <div className="flex justify-end gap-2.5">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          Book appointment
        </Button>
      </div>
    </form>
  )
}
