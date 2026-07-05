import { useState } from 'react'
import { btnDanger, btnSecondary, card, fieldInput } from '../styles'

const CONFIRM_WORD = 'confirm'

interface Props {
  title: string
  warning: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteModal({ title, warning, onConfirm, onCancel }: Props) {
  const [typed, setTyped] = useState('')
  const canConfirm = typed.trim().toLowerCase() === CONFIRM_WORD

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className={`${card} flex w-full max-w-[360px] flex-col gap-3.5`}>
        <h2 id="confirm-delete-title" className="text-lg font-bold text-high">
          {title}
        </h2>
        <p className="text-sm text-text">{warning}</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] text-text">
            Type <strong className="text-text-h">confirm</strong> to proceed
          </span>
          <input
            type="text"
            className={fieldInput}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </label>
        <div className="flex justify-end gap-2.5">
          <button className={btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button className={btnDanger} disabled={!canConfirm} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
