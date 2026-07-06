import { useState } from 'react'
import { Button } from './common/Button'
import { TextInput } from './common/TextInput'
import { card, dimmedBackdrop } from '../styles'

const CONFIRM_WORD = 'confirm'

interface Props {
  title: string
  warning: string
  /** 'typeConfirm' requires typing the word "confirm"; 'yesNo' is a plain two-button prompt. */
  mode: 'typeConfirm' | 'yesNo'
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'neutral'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  warning,
  mode,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'neutral',
  onConfirm,
  onCancel,
}: Props) {
  const [typed, setTyped] = useState('')
  const canConfirm = mode === 'yesNo' || typed.trim().toLowerCase() === CONFIRM_WORD

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-5 ${dimmedBackdrop}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={`${card} flex w-full max-w-[360px] flex-col gap-3.5`}>
        <h2
          id="confirm-modal-title"
          className={`text-lg font-bold ${tone === 'danger' ? 'text-high' : 'text-text-h'}`}
        >
          {title}
        </h2>
        <p className="text-sm text-text">{warning}</p>
        {mode === 'typeConfirm' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] text-text">
              Type <strong className="text-text-h">confirm</strong> to proceed
            </span>
            <TextInput
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </label>
        )}
        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} disabled={!canConfirm} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
