import { useMemo, useState } from 'react'
import type { Patient, PatientGroup } from '../types'
import { getPatientAge } from '../utils/age'
import { MIN_SEARCH_LENGTH, queryPatients } from '../utils/patientQuery'
import type { PatientSort } from '../utils/patientQuery'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { Select } from './common/Select'
import { fieldLabel, fieldLabelText } from '../styles'

interface Props {
  patients: Patient[]
  groups: PatientGroup[]
  onSelect: (id: string) => void
}

function FilterSortIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2.2" fill="currentColor" stroke="none" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="16" cy="17" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function PatientList({ patients, groups, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [groupId, setGroupId] = useState('')
  const [sort, setSort] = useState<PatientSort>('default')
  const [filterOpen, setFilterOpen] = useState(false)

  const visible = useMemo(
    () => queryPatients(patients, groups, { search, groupId, sort }),
    [patients, groups, search, groupId, sort],
  )

  const groupName = (id?: string) => groups.find((g) => g.id === id)?.name
  const isFilterActive = groupId !== '' || sort !== 'default'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <label className={`${fieldLabel} flex-1`}>
          <span className={fieldLabelText}>Search</span>
          <TextInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Name or number (${MIN_SEARCH_LENGTH}+ chars)`}
          />
        </label>

        <div className="relative shrink-0">
          <Button
            variant="iconCircle"
            className="border border-border bg-bg text-text-h"
            aria-label="Filter and sort"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <FilterSortIcon />
          </Button>
          {isFilterActive && (
            <span className="pointer-events-none absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent" />
          )}

          {filterOpen && (
            <>
              <Button
                variant="unstyled"
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
                aria-label="Close filter and sort"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-2 flex w-60 flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-card">
                <label className={fieldLabel}>
                  <span className={fieldLabelText}>Group</span>
                  <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                    <option value="">All groups</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className={fieldLabel}>
                  <span className={fieldLabelText}>Sort</span>
                  <Select value={sort} onChange={(e) => setSort(e.target.value as PatientSort)}>
                    <option value="default">Newest first</option>
                    <option value="group">By group</option>
                  </Select>
                </label>
              </div>
            </>
          )}
        </div>
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
                <Button
                  variant="unstyled"
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
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
