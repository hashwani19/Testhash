import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Priority } from '../types'

interface Props {
  onAdd: (title: string, priority: Priority, notes?: string) => void
}

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [expanded, setExpanded] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, priority, notes)
    setTitle('')
    setNotes('')
    setPriority('medium')
    setExpanded(false)
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <div className="task-form-row">
        <input
          type="text"
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          aria-label="Task title"
        />
        <button type="submit" className="btn-primary" disabled={!title.trim()}>
          Add
        </button>
      </div>
      {expanded && (
        <div className="task-form-details">
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label="Task notes"
          />
          <div className="priority-picker" role="radiogroup" aria-label="Priority">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                type="button"
                key={p}
                className={`priority-chip priority-${p} ${priority === p ? 'active' : ''}`}
                aria-pressed={priority === p}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
