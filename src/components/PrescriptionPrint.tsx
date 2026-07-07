import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { EyeRefraction, EyeVisit, Patient, PrescriptionTemplate } from '../types'
import { getPatientAge } from '../utils/age'
import { Button } from './common/Button'
import { dimmedBackdrop } from '../styles'

interface Props {
  patient: Patient
  visit: EyeVisit
  template: PrescriptionTemplate
  onClose: () => void
  /** Called once, right before the print dialog opens — the caller logs
   *  this as an export-class audit entry (docs/design.md §5.6/§10). */
  onPrinted: () => void
}

function formatSigned(value?: number): string {
  if (value == null) return ''
  return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
}

function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatVisitDateTime(visitAt: string): string {
  return new Date(visitAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Every cell always renders, blank if unset — deliberately not the
// hide-if-empty behavior the on-screen visit history uses (§5.6): a printed
// prescription should show its full fixed shape, same as a real pad.
function RefractionCells({ refraction }: { refraction: EyeRefraction }) {
  return (
    <>
      <td className="border border-black/30 px-2 py-1 text-center">{formatSigned(refraction.sphere)}</td>
      <td className="border border-black/30 px-2 py-1 text-center">{formatSigned(refraction.cylinder)}</td>
      <td className="border border-black/30 px-2 py-1 text-center">
        {refraction.axis != null ? `${refraction.axis}°` : ''}
      </td>
      <td className="border border-black/30 px-2 py-1 text-center">{refraction.visualAcuity ?? ''}</td>
    </>
  )
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold">{label}: </span>
      {value || '—'}
    </p>
  )
}

/**
 * Full-screen print overlay for a single visit's prescription (docs/
 * design.md §5.6) — rendered via a portal directly onto `document.body`
 * (not nested inside #root like every other overlay in this app) so print
 * CSS can hide the entire normal app tree (`#root`, index.css) while this
 * stays visible, without needing to thread a `.no-print` class through
 * every screen individually.
 *
 * US Letter-sized (`@page { size: letter; }`, set inline below rather than
 * in index.css since the top margin depends on the live template's
 * `topMarginMm` rather than being a fixed value).
 *
 * Always renders in fixed black-on-white, regardless of the viewer's own
 * theme preference (§5.2/§8.10) — deliberately doesn't use the app's
 * theme-aware `bg-surface`/`text-text-h` classes, since a printed medical
 * document needs to stay legible and ink-economical on paper no matter what
 * a staff member's personal dark-mode setting is.
 */
export function PrescriptionPrint({ patient, visit, template, onClose, onPrinted }: Props) {
  const hasPrinted = useRef(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (hasPrinted.current) return
    hasPrinted.current = true
    onPrinted()
    const id = requestAnimationFrame(() => window.print())
    return () => cancelAnimationFrame(id)
    // Runs once on mount only — onPrinted/onClose identity changes shouldn't re-trigger a print.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Dismissing the print UI — printed *or* cancelled — leaves the page
    // without focus on some browsers/webviews, so the very next tap gets
    // spent reclaiming it instead of hitting whatever it landed on. Three
    // overlapping signals rather than just one: `afterprint` doesn't
    // reliably fire on every platform (particularly iOS Safari, where
    // printing goes through a native share-sheet/print UI rather than an
    // in-page dialog).
    //
    // Focuses the visible Close button specifically — not `window.focus()`
    // (on iOS this appeared to summon some part of the browser's own chrome
    // near the top of the screen instead of anything in the page) and not
    // a full-viewport backdrop div (a focus ring around something that big,
    // with nothing to actually click, is exactly the "not actionable"
    // symptom this was meant to fix, not a fix for it). A real, visible,
    // already-interactive button is the one target guaranteed to both look
    // right and do something useful if the ring is visible and gets tapped.
    const reclaimFocus = () => closeButtonRef.current?.focus()

    window.addEventListener('afterprint', reclaimFocus)

    const mediaQueryList = window.matchMedia('print')
    const onMediaChange = (e: MediaQueryListEvent) => {
      if (!e.matches) reclaimFocus()
    }
    mediaQueryList.addEventListener('change', onMediaChange)

    // The most reliable signal on mobile: the native print/share UI
    // backgrounds the page, and this fires when it's dismissed either way.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') reclaimFocus()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('afterprint', reclaimFocus)
      mediaQueryList.removeEventListener('change', onMediaChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  const age = getPatientAge(patient)
  const topMarginMm = 15 + Math.max(template.topMarginMm, 0)

  return createPortal(
    <>
      <style>{`@page { size: letter; margin: ${topMarginMm}mm 15mm 15mm 15mm; }`}</style>

      <div className={`fixed inset-0 z-50 overflow-y-auto print:hidden ${dimmedBackdrop}`} onClick={onClose} />

      <div className="relative z-50 mx-auto my-8 w-full max-w-[8.5in] bg-white p-8 text-[13px] text-black shadow-card print:m-0 print:w-auto print:max-w-none print:p-0 print:shadow-none">
        {template.logoDataUrl && (
          // Absolutely positioned and first in DOM order so every later
          // (normal-flow) sibling below paints on top of it automatically —
          // no z-index juggling needed to keep the watermark behind the text.
          <img
            src={template.logoDataUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto h-2/3 w-2/3 object-contain opacity-10"
          />
        )}

        {template.showLetterhead && (
          <header className="mb-4 border-b-2 border-black pb-3 text-center">
            <h1 className="text-2xl font-bold">Ortho and Vision Care</h1>
          </header>
        )}

        <div className="mb-4 flex flex-wrap justify-between gap-2">
          <div>
            <p className="font-semibold">
              {patient.name} <span className="font-normal">({patient.patientNumber})</span>
            </p>
            <p>
              Age: {age != null ? `${age} years` : '—'} · Gender:{' '}
              {patient.gender === 'unspecified' ? '—' : patient.gender}
            </p>
          </div>
          <p>Visit: {formatVisitDateTime(visit.visitAt)}</p>
        </div>

        <table className="mb-4 w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-black/30 px-2 py-1"></th>
              <th className="border border-black/30 px-2 py-1" colSpan={4}>
                Right eye
              </th>
              <th className="border border-black/30 px-2 py-1" colSpan={4}>
                Left eye
              </th>
            </tr>
            <tr>
              <th className="border border-black/30 px-2 py-1"></th>
              <th className="border border-black/30 px-2 py-1">Sph</th>
              <th className="border border-black/30 px-2 py-1">Cyl</th>
              <th className="border border-black/30 px-2 py-1">Axis</th>
              <th className="border border-black/30 px-2 py-1">V.A.</th>
              <th className="border border-black/30 px-2 py-1">Sph</th>
              <th className="border border-black/30 px-2 py-1">Cyl</th>
              <th className="border border-black/30 px-2 py-1">Axis</th>
              <th className="border border-black/30 px-2 py-1">V.A.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border border-black/30 px-2 py-1 text-left font-normal">Distance</th>
              <RefractionCells refraction={visit.refractions.right.distance} />
              <RefractionCells refraction={visit.refractions.left.distance} />
            </tr>
            <tr>
              <th className="border border-black/30 px-2 py-1 text-left font-normal">Reading</th>
              <RefractionCells refraction={visit.refractions.right.reading} />
              <RefractionCells refraction={visit.refractions.left.reading} />
            </tr>
          </tbody>
        </table>

        <div className="mb-4 flex flex-col gap-1.5">
          <DetailLine label="Lenses" value={visit.lenses ?? ''} />
          <DetailLine label="Diagnosis" value={visit.diagnosis ?? ''} />
          <DetailLine label="Treatment plan" value={visit.treatmentPlan ?? ''} />
          <DetailLine label="Follow-up" value={visit.followUpDate ? formatDateOnly(visit.followUpDate) : ''} />
          <DetailLine label="Notes" value={visit.notes ?? ''} />
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-48 border-t border-black pt-1 text-center">Signature</div>
        </div>

        {template.footerNote && (
          <p className="mt-8 border-t border-black/30 pt-2 text-center text-xs">{template.footerNote}</p>
        )}
      </div>

      <div className="fixed right-4 top-4 z-50 flex gap-2 print:hidden">
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
        <Button
          ref={closeButtonRef}
          variant="icon"
          aria-label="Close"
          className="h-9 w-9 rounded-full bg-surface/90 text-xl leading-none"
          onClick={onClose}
        >
          ×
        </Button>
      </div>
    </>,
    document.body,
  )
}
