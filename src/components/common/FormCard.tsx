import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Button } from './Button'
import { ConfirmModal } from '../ConfirmModal'
import { card, cx } from '../../styles'

interface Props {
  title: string
  onCancel: () => void
  onSubmit: (e: FormEvent) => void
  submitLabel: string
  submitDisabled?: boolean
  /** Whether cancelling would actually lose something — when true, the
   *  header × and footer Cancel both confirm before discarding instead of
   *  closing silently. Omit (or leave false) for a form where nothing
   *  meaningful can be lost by closing (e.g. it starts empty and has
   *  nothing typed into it yet). */
  isDirty?: boolean
  discardTitle?: string
  discardWarning?: string
  children: ReactNode
  className?: string
}

/**
 * The one place a "form that is its own screen" renders through — a card
 * with a title + × (cancel) in the header and Cancel/Save in the footer,
 * generalized from EyeRecordForm's original header-×-plus-footer-buttons
 * shape so every such form (adding a tenant, a visit record, ...) looks
 * and behaves the same way instead of each screen hand-rolling it.
 */
export function FormCard({
  title,
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled,
  isDirty = false,
  discardTitle = 'Discard changes?',
  discardWarning = "The details you've entered haven't been saved and will be lost.",
  children,
  className,
}: Props) {
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const requestCancel = () => {
    if (isDirty) setConfirmingCancel(true)
    else onCancel()
  }

  return (
    <>
      <form className={cx(card, 'flex flex-col gap-3.5', className)} onSubmit={onSubmit}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-text-h">{title}</h2>
          <Button variant="icon" aria-label="Cancel" onClick={requestCancel}>
            ×
          </Button>
        </div>

        {children}

        <div className="flex justify-end gap-2.5">
          <Button variant="secondary" onClick={requestCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </form>

      {confirmingCancel && (
        <ConfirmModal
          title={discardTitle}
          warning={discardWarning}
          mode="yesNo"
          confirmLabel="Discard"
          onConfirm={() => {
            setConfirmingCancel(false)
            onCancel()
          }}
          onCancel={() => setConfirmingCancel(false)}
        />
      )}
    </>
  )
}
