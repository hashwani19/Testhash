import { useMemo, useState } from 'react'
import type { Patient, PatientGroup } from '../types'
import { getPatientAge } from '../utils/age'
import { MIN_SEARCH_LENGTH, queryPatients } from '../utils/patientQuery'
import type { PatientSort } from '../utils/patientQuery'

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
    <div className="patient-list-controls">
      <div className="field-row">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Name or patient number (${MIN_SEARCH_LENGTH}+ chars)`}
          />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Group</span>
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as PatientSort)}>
            <option value="default">Newest first</option>
            <option value="group">By group</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">
          {patients.length === 0 ? 'No patients yet. Add the first one.' : 'No patients match.'}
        </p>
      ) : (
        <ul className="patient-list">
          {visible.map((patient) => {
            const age = getPatientAge(patient)
            const group = groupName(patient.groupId)
            return (
              <li key={patient.id}>
                <button className="patient-card" onClick={() => onSelect(patient.id)}>
                  <span className="patient-name">
                    {patient.name}
                    {group && <span className="group-chip">{group}</span>}
                  </span>
                  <span className="patient-meta">
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
