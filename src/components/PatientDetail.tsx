import { useState } from 'react'
import type { EyeVisit, Patient, PatientGroup } from '../types'
import { getPatientAge } from '../utils/age'
import { EyeRecordHistory } from './EyeRecordHistory'
import { ConfirmModal } from './ConfirmModal'
import { Button } from './Button'
import { card } from '../styles'

interface Props {
  patient: Patient
  groups: PatientGroup[]
  visits: EyeVisit[]
  canDeleteRecords: boolean
  canDeletePatient: boolean
  onEdit: () => void
  onDelete: () => void
  onAddRecord: () => void
  onEditRecord: (visit: EyeVisit) => void
  onDeleteRecord: (id: string) => void
  onBack: () => void
}

export function PatientDetail({
  patient,
  groups,
  visits,
  canDeleteRecords,
  canDeletePatient,
  onEdit,
  onDelete,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
  onBack,
}: Props) {
  const age = getPatientAge(patient)
  const groupName = groups.find((g) => g.id === patient.groupId)?.name
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" onClick={onBack}>
        ‹ All patients
      </Button>

      <div className={`${card} flex flex-col gap-3.5`}>
        <h2 className="text-[22px] font-bold text-text-h">{patient.name}</h2>
        <p className="text-sm text-text">{patient.patientNumber}</p>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-text">Age</dt>
            <dd className="mt-0.5 capitalize text-text-h">
              {age != null ? `${age} years` : 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text">Date of birth</dt>
            <dd className="mt-0.5 capitalize text-text-h">{patient.dob || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text">Gender</dt>
            <dd className="mt-0.5 capitalize text-text-h">
              {patient.gender === 'unspecified' ? 'Unspecified' : patient.gender}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text">Group</dt>
            <dd className="mt-0.5 capitalize text-text-h">{groupName || 'No group'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-text">Address</dt>
            <dd className="mt-0.5 capitalize text-text-h">{patient.address || 'Not provided'}</dd>
          </div>
        </dl>
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onEdit}>
            Edit patient
          </Button>
          {canDeletePatient && (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete patient
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-text-h">Eye treatment history</h3>
        <Button variant="primary" onClick={onAddRecord}>
          Add record
        </Button>
      </div>

      <EyeRecordHistory
        visits={visits}
        canDelete={canDeleteRecords}
        onEdit={onEditRecord}
        onDelete={onDeleteRecord}
      />

      {confirmingDelete && (
        <ConfirmModal
          title="Delete this patient?"
          warning={
            visits.length === 0
              ? `This permanently deletes ${patient.name} (${patient.patientNumber}). This cannot be undone.`
              : `This permanently deletes ${patient.name} (${patient.patientNumber}) along with their ${
                  visits.length
                } eye treatment history record${visits.length === 1 ? '' : 's'}. This cannot be undone.`
          }
          mode="typeConfirm"
          confirmLabel="Delete"
          tone="danger"
          onConfirm={() => {
            setConfirmingDelete(false)
            onDelete()
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
