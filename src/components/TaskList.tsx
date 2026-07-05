import type { Task } from '../types'

interface Props {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onToggle, onDelete }: Props) {
  if (tasks.length === 0) {
    return <p className="empty-state">Nothing here. Add a task to get started.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
          <label className="task-checkbox">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => onToggle(task.id)}
              aria-label={`Mark "${task.title}" as ${task.done ? 'active' : 'done'}`}
            />
            <span className={`priority-dot priority-${task.priority}`} />
          </label>
          <div className="task-body">
            <span className="task-title">{task.title}</span>
            {task.notes && <span className="task-notes">{task.notes}</span>}
          </div>
          <button
            className="btn-icon"
            aria-label={`Delete "${task.title}"`}
            onClick={() => onDelete(task.id)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
