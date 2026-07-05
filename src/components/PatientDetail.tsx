import type { EyeVisit, Patient, PatientGroup } from '../types'
import { getPatientAge } from '../utils/age'
import { EyeRecordHistory } from './EyeRecordHistory'

interface Props {
  patient: Patient
  groups: PatientGroup[]
  visits: EyeVisit[]
  canDeleteRecords: boolean
  canDeletePatient: boolean
  onEdit: () => void
  onDelete: () => void
  onAddRecord: () => void
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
  onDeleteRecord,
  onBack,
}: Props) {
  const age = getPatientAge(patient)
  const groupName = groups.find((g) => g.id === patient.groupId)?.name

  return (
    <div className="patient-detail">
      <button className="btn-link" onClick={onBack}>
        ‹ All patients
      </button>

      <div className="patient-summary">
        <h2>{patient.name}</h2>
        <p className="subtitle">{patient.patientNumber}</p>
        <dl className="patient-facts">
          <div>
            <dt>Age</dt>
            <dd>{age != null ? `${age} years` : 'Unknown'}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>{patient.dob || 'Not provided'}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{patient.gender === 'unspecified' ? 'Unspecified' : patient.gender}</dd>
          </div>
          <div>
            <dt>Group</dt>
            <dd>{groupName || 'No group'}</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{patient.address || 'Not provided'}</dd>
          </div>
        </dl>
        <div className="form-actions">
          <button className="btn-secondary" onClick={onEdit}>
            Edit patient
          </button>
          {canDeletePatient && (
            <button className="btn-danger" onClick={onDelete}>
              Delete patient
            </button>
          )}
        </div>
      </div>

      <div className="section-header">
        <h3>Eye treatment history</h3>
        <button className="btn-primary" onClick={onAddRecord}>
          Add record
        </button>
      </div>

      <EyeRecordHistory visits={visits} canDelete={canDeleteRecords} onDelete={onDeleteRecord} />
    </div>
  )
}
