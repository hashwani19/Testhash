import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Patient, PatientGroup } from '../types'
import { btnIcon, btnLink, btnPrimary, card, fieldInput } from '../styles'

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
    <div className="flex flex-col gap-3.5">
      <button className={btnLink} onClick={onBack}>
        ‹ All patients
      </button>

      <h2 className="text-xl font-bold text-text-h">Manage Patient Groups</h2>
      <p className="text-sm text-text">
        Admin-only. Doctors and front desk can assign patients to these groups but can't create or
        remove them.
      </p>

      <form className={`${card} flex flex-col gap-3.5`} onSubmit={submitNew}>
        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            className={`${fieldInput} min-w-[90px] flex-1`}
            placeholder="New group name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            aria-label="New group name"
          />
          <button type="submit" className={btnPrimary} disabled={!newName.trim()}>
            Add
          </button>
        </div>
      </form>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-text">No groups yet. Add one above.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => (
            <li
              key={group.id}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5"
            >
              {editingId === group.id ? (
                <input
                  type="text"
                  className={`${fieldInput} flex-1`}
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => saveEdit(group.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(group.id)}
                  autoFocus
                  aria-label="Rename group"
                />
              ) : (
                <button
                  className="flex-1 cursor-pointer border-none bg-transparent p-0 text-left font-semibold text-text-h"
                  onClick={() => startEdit(group)}
                >
                  {group.name}
                </button>
              )}
              <span className="whitespace-nowrap text-xs text-text">
                {patientCount(group.id)} patient(s)
              </span>
              <button
                className={btnIcon}
                aria-label={`Delete ${group.name}`}
                onClick={() => {
                  if (
                    confirm(
                      `Delete group "${group.name}"? Existing patients keep their group name on record.`,
                    )
                  ) {
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
