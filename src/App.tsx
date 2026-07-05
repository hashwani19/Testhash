import { useMemo, useState } from 'react'
import { useTasks } from './hooks/useTasks'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { OfflineBanner } from './components/OfflineBanner'
import { InstallBanner } from './components/InstallBanner'
import type { Filter } from './types'
import './App.css'

function App() {
  const { tasks, addTask, toggleTask, deleteTask, clearCompleted } = useTasks()
  const [filter, setFilter] = useState<Filter>('all')

  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.done)
    if (filter === 'done') return tasks.filter((t) => t.done)
    return tasks
  }, [tasks, filter])

  const remaining = tasks.filter((t) => !t.done).length

  return (
    <div className="app">
      <OfflineBanner />
      <InstallBanner />

      <header className="app-header">
        <h1>Tasks</h1>
        <p className="subtitle">
          {remaining === 0 ? 'All caught up' : `${remaining} task${remaining === 1 ? '' : 's'} left`}
        </p>
      </header>

      <main className="app-main">
        <TaskForm onAdd={addTask} />

        <nav className="filter-tabs" aria-label="Filter tasks">
          {(['all', 'active', 'done'] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          ))}
        </nav>

        <TaskList tasks={visibleTasks} onToggle={toggleTask} onDelete={deleteTask} />

        {tasks.some((t) => t.done) && (
          <button className="btn-link" onClick={clearCompleted}>
            Clear completed
          </button>
        )}
      </main>
    </div>
  )
}

export default App
