import { useMemo, useState } from 'react'
import type { Patient, PatientGroup } from '../types'
import { getPatientAge } from '../utils/age'
import { MIN_SEARCH_LENGTH, queryPatients } from '../utils/patientQuery'
import type { PatientSort } from '../utils/patientQuery'
import { fieldInput, fieldLabel, fieldLabelText } from '../styles'

interface Props {
  patients: Patient[]
  groups: PatientGroup[]
  onSelect: (id: string) => void
}

export function PatientList({ patients, groups, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [sort, setSort] = useState<PatientSort>('default')

  const visible = useMemo(
    () => queryPatients(patients, groups, { search, groupId, sort }),
    [patients, groups, search, groupId, sort],
  )

  const groupName = (id?: string) => groups.find((g) => g.id === id)?.name

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2.5">
        <label className={fieldLabel}>
          <span className={fieldLabelText}>Search</span>
          <input
            type="search"
            className={fieldInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Name or patient number (${MIN_SEARCH_LENGTH}+ chars)`}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Group</span>
          <select className={fieldInput} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className={`${fieldLabel} min-w-[90px]`}>
          <span className={fieldLabelText}>Sort</span>
          <select
            className={fieldInput}
            value={sort}
            onChange={(e) => setSort(e.target.value as PatientSort)}
          >
            <option value="default">Newest first</option>
            <option value="group">By group</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-text">
          {patients.length === 0 ? 'No patients yet. Add the first one.' : 'No patients match.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((patient) => {
            const age = getPatientAge(patient)
            const group = groupName(patient.groupId)
            return (
              <li key={patient.id}>
                <button
                  className="flex w-full flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3.5 text-left cursor-pointer"
                  onClick={() => onSelect(patient.id)}
                >
                  <span className="font-semibold text-text-h">
                    {patient.name}
                    {group && (
                      <span className="ml-2 rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] font-medium text-text">
                        {group}
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] capitalize text-text">
                    {patient.patientNumber} · {age != null ? `${age} yrs` : 'Age unknown'} ·{' '}
                    {patient.gender === 'unspecified' ? 'Gender unspecified' : patient.gender}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
