import type { Role } from '../types'
import { ROLE_OPTIONS } from '../utils/roles'

interface Props {
  value: Role[]
  onChange: (roles: Role[]) => void
  /** Roles rendered checked-but-locked — used to show (not just enforce
   *  server-side) that a tenant founder's `admin` role can't be unchecked. */
  disabledValues?: Role[]
}

/** A user can hold more than one role at once — access is the union of
 *  every held role's permissions. Shared by the "Add user" form
 *  (`UserForm`) and each row's "Edit roles" inline editor
 *  (`UsersScreen`). */
export function RoleCheckboxes({ value, onChange, disabledValues = [] }: Props) {
  const toggle = (role: Role) => {
    if (disabledValues.includes(role)) return
    onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role])
  }

  return (
    <div className="flex flex-wrap gap-3">
      {ROLE_OPTIONS.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-[15px] text-text-h">
          <input
            type="checkbox"
            className="accent-accent"
            checked={value.includes(opt.value)}
            disabled={disabledValues.includes(opt.value)}
            onChange={() => toggle(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}
