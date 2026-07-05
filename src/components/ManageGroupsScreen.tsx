import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Patient, PatientGroup } from '../types'

interface Props {
  groups: PatientGroup[]
  patients: Patient[]
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onBack: () => void
}

export function ManageGroupsScreen({ groups, patients, onAdd, onRename, onDelete, onBack }: Props) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const submitNew = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setNewName('')
  }

  const startEdit = (group: PatientGroup) => {
    setEditingId(group.id)
    setEditingName(group.name)
  }

  const saveEdit = (id: string) => {
    const trimmed = editingName.trim()
    if (trimmed) onRename(id, trimmed)
    setEditingId(null)
  }

  const patientCount = (groupId: string) => patients.filter((p) => p.groupId === groupId).length

  return (
    <div className="manage-groups">
      <button className="btn-link" onClick={onBack}>
        ‹ All patients
      </button>

      <h2>Manage Patient Groups</h2>
      <p className="subtitle">Admin-only. Doctors and front desk can assign patients to these groups but can't create or remove them.</p>

      <form className="panel-form" onSubmit={submitNew}>
        <div className="field-row">
          <label className="field">
            <input
              type="text"
              placeholder="New group name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              aria-label="New group name"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={!newName.trim()}>
            Add
          </button>
        </div>
      </form>

      {groups.length === 0 ? (
        <p className="empty-state">No groups yet. Add one above.</p>
      ) : (
        <ul className="group-list">
          {groups.map((group) => (
            <li key={group.id} className="group-item">
              {editingId === group.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => saveEdit(group.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(group.id)}
                  autoFocus
                  aria-label="Rename group"
                />
              ) : (
                <button className="group-name-btn" onClick={() => startEdit(group)}>
                  {group.name}
                </button>
              )}
              <span className="group-count">{patientCount(group.id)} patient(s)</span>
              <button
                className="btn-icon"
                aria-label={`Delete ${group.name}`}
                onClick={() => {
                  if (confirm(`Delete group "${group.name}"? Existing patients keep their group name on record.`)) {
                    onDelete(group.id)
                  }
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
