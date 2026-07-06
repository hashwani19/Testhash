import type { Role } from '../types'
import { cx } from '../styles'

export type NavTarget = 'patients' | 'groups' | 'activity' | 'appointments'

const NAV_ITEMS: Array<{ target: NavTarget; label: string; adminOnly?: boolean }> = [
  { target: 'patients', label: 'Patients' },
  { target: 'groups', label: 'Groups', adminOnly: true },
  { target: 'activity', label: 'Activity', adminOnly: true },
  { target: 'appointments', label: 'Appointments' },
]

interface Props {
  open: boolean
  role: Role
  active: NavTarget
  onNavigate: (target: NavTarget) => void
  onClose: () => void
}

export function NavMenu({ open, role, active, onNavigate, onClose }: Props) {
  if (!open) return null

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin')

  return (
    <div className="fixed inset-0 z-50 flex">
      <nav className="flex w-64 max-w-[80%] flex-col gap-1 overflow-y-auto bg-surface p-4 shadow-card">
        <h2 className="mb-2 px-2 text-lg font-bold text-text-h">Menu</h2>
        {items.map((item) => (
          <button
            key={item.target}
            className={cx(
              'cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-[15px] font-medium',
              item.target === active ? 'bg-accent text-accent-contrast' : 'bg-transparent text-text-h',
            )}
            onClick={() => {
              onNavigate(item.target)
              onClose()
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="flex-1 cursor-default border-none bg-black/40" aria-label="Close menu" onClick={onClose} />
    </div>
  )
}
