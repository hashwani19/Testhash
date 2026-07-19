import { useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import type { EyeRefraction, EyeVisit, Patient, PrescriptionTemplate } from '../types'
import { getPatientAge } from '../utils/age'
import { Button } from './common/Button'
import { dimmedBackdrop } from '../styles'

interface Props {
  patient: Patient
  visit: EyeVisit
  template: PrescriptionTemplate
  onClose: () => void
  /** Called each time Print is tapped, right before the print dialog opens
   *  — the caller logs this as an export-class audit entry (docs/
   *  design.md §5.6/§10). Printing twice in one session logs twice,
   *  matching two real print actions. */
  onPrinted: () => void
}

// Matches the string every other hardcoded "Ortho and Vision Care" surface
// still uses (LoginScreen, AppHeader, index.html) — this is the only one of
// the four that became admin-editable (docs/design.md §5.6); the other
// three are a separate, unimplemented "tenant branding" concept (§5.5).
const DEFAULT_CLINIC_NAME = 'Ortho and Vision Care'

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
  // [checkpoint D] The actual cause, confirmed by the browser's own words:
  // Chrome/Safari block window.print() as "automatic printing" — the same
  // family of heuristic as popup blocking — whenever it isn't called
  // *synchronously* inside a direct user-gesture handler (a click/tap
  // callback, with nothing async in between). Every earlier attempt at this
  // bug (checkpoints A-C: image-decode waits, removing position:fixed
  // chrome from the DOM, pinning the overlay into the viewport) called
  // window.print() from inside a useEffect after mount, or after awaiting
  // logoRef.current.decode() — both cross an async boundary, so the browser
  // no longer considers the call gesture-initiated no matter how soon after
  // the tap it happens, and silently (or with a "blocked from automatic
  // printing" prompt) drops it. Printing now happens ONLY from `printNow`
  // below, called directly by the Print button's onClick with nothing
  // awaited first — that's what keeps it inside the gesture.
  //
  // [checkpoint B] `position: fixed` elements have long-standing,
  // documented WebKit/Chromium print bugs — `display: none` under
  // `@media print` (this file's `print:hidden` class) isn't reliably
  // respected on them the way it is on normal-flow elements, because the
  // print pagination engine gives fixed-position boxes special handling
  // (there's no well-defined "which printed page" for something anchored
  // to the viewport). Rather than trust the CSS, `printNow` physically
  // removes the backdrop/controls from the DOM (via `flushSync`, so the
  // removal is guaranteed to commit before `window.print()` actually runs)
  // instead of just hiding them.
  const [isPrinting, setIsPrinting] = useState(false)
  const restoreTimeoutRef = useRef<number | null>(null)
  const printNow = () => {
    onPrinted()
    flushSync(() => setIsPrinting(true))
    window.print()
    // [checkpoint E] window.print() has no callback/promise — there's no
    // programmatic way to know whether it actually opened a print UI or
    // was silently/interactively declined by the browser's own "blocked
    // from automatic printing" gate (observed on iOS Safari even on a
    // direct tap of this button, not just an auto-triggered call). When
    // that happens, none of the afterprint/matchMedia/visibilitychange
    // signals below ever fire, since no print flow actually started — and
    // the backdrop/Close button were already removed above in
    // anticipation of a successful print, leaving the overlay with no
    // in-overlay way to dismiss it (a real report: stuck until navigating
    // away via the app's own breadcrumb). This timeout is a safety net,
    // not a detector: it restores the controls regardless, a beat after
    // the call, so the overlay is never permanently stuck. If printing did
    // succeed, onClose() already ran and unmounted this component first,
    // making the pending restore a harmless no-op.
    restoreTimeoutRef.current = window.setTimeout(() => setIsPrinting(false), 1200)
  }

  useEffect(() => {
    return () => {
      if (restoreTimeoutRef.current != null) window.clearTimeout(restoreTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    // Two earlier attempts tried to manage *focus* on this overlay after the
    // native print/share UI closes (window.focus(), then focusing the Close
    // button). Both missed the actual problem: this overlay staying open at
    // all once the user is done with the print UI is exactly what reads as
    // a stuck, separate "print preview" needing an extra tap to dismiss —
    // on iOS in particular, where printing goes through a native share-
    // sheet rather than an in-page dialog, so returning to the page leaves
    // this on-screen preview sitting there with nothing to indicate it's
    // this app's own UI rather than leftover print-system chrome. Instead
    // of fixing focus on it, just close it — the same three overlapping
    // signals as before (afterprint doesn't reliably fire on every
    // platform; matchMedia and visibilitychange cover the gap, with
    // visibilitychange being the most reliable on mobile since the native
    // UI backgrounds the page either way it's dismissed), but calling
    // onClose() instead of trying to refocus something.
    let dismissed = false
    const handlePrintUiClosed = () => {
      if (dismissed) return
      dismissed = true
      onClose()
    }

    window.addEventListener('afterprint', handlePrintUiClosed)

    const mediaQueryList = window.matchMedia('print')
    const onMediaChange = (e: MediaQueryListEvent) => {
      if (!e.matches) handlePrintUiClosed()
    }
    mediaQueryList.addEventListener('change', onMediaChange)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') handlePrintUiClosed()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('afterprint', handlePrintUiClosed)
      mediaQueryList.removeEventListener('change', onMediaChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [onClose])

  const age = getPatientAge(patient)
  const topMarginMm = 15 + Math.max(template.topMarginMm, 0)

  return createPortal(
    <>
      <style>{`@page { size: letter; margin: ${topMarginMm}mm 15mm 15mm 15mm; }`}</style>

      {/* [checkpoint C] Purely the dim color layer — no scroll, no click
       * handling of its own. The actual printable content below has its own
       * fixed/scrollable wrapper so it's pinned into the viewport the
       * instant the overlay opens, rather than sitting wherever it lands in
       * normal document flow (after #root, i.e. below the entire rest of
       * the app — requiring a scroll past the current screen to even reach
       * it on screen, before this). Kept alongside the checkpoint D fix
       * above since it's a real, independent improvement either way. */}
      {!isPrinting && (
        <div className={`fixed inset-0 z-50 print:hidden ${dimmedBackdrop}`} />
      )}

      <div
        className={
          isPrinting
            ? undefined
            : // Reserves space for the fixed Print/Close controls (below) so
              // the scrolled-to-top content starts underneath them instead
              // of the controls floating on top of — and hiding — whatever
              // text happens to be in the page's top-right corner. Matches
              // that control's own top offset (1rem + safe-area-inset-top)
              // plus its rendered height and a small gap.
              'fixed inset-0 z-50 overflow-y-auto pt-[calc(5rem_+_env(safe-area-inset-top))]'
        }
        onClick={isPrinting ? undefined : (e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative z-50 mx-auto my-8 w-full max-w-[8.5in] bg-white p-8 text-[13px] text-black shadow-card print:m-0 print:w-auto print:max-w-none print:p-0 print:shadow-none">
          {template.logoDataUrl && (
            // Absolutely positioned and first in DOM order so every later
            // (normal-flow) sibling below paints on top of it automatically —
            // no z-index juggling needed to keep the watermark behind the
            // text. Re-added after confirming the blank mobile print preview
            // happens with or without a logo — it was never the cause.
            <img
              src={template.logoDataUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 m-auto h-2/3 w-2/3 object-contain opacity-10"
            />
          )}

          {template.showLetterhead && (
            <header className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b-2 border-black pb-3">
              <div className="flex items-start gap-3">
                {template.logoDataUrl && (
                  <img src={template.logoDataUrl} alt="" className="h-14 w-14 shrink-0 object-contain" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{template.clinicName?.trim() || DEFAULT_CLINIC_NAME}</h1>
                  {template.clinicAddress && (
                    <p className="whitespace-pre-line text-xs">{template.clinicAddress}</p>
                  )}
                </div>
              </div>

              {(template.doctorName || template.doctorCredentials) && (
                <div className="shrink-0 text-right">
                  {template.doctorName && <p className="font-semibold">{template.doctorName}</p>}
                  {template.doctorCredentials && (
                    <p className="whitespace-pre-line text-xs">{template.doctorCredentials}</p>
                  )}
                </div>
              )}
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

          {/* This table's 9 columns don't shrink below their content's
           * natural width — on a phone-width screen that's wider than the
           * viewport, and without its own scroll container that excess
           * width was forcing the whole card (and page) wider than the
           * screen, bleeding past the right edge with no way to reach it.
           * print:overflow-visible since at the actual printed page width
           * (this card's design width, §5.6) the table always fits. */}
          <div className="mb-4 overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse">
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
          </div>

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
      </div>

      {!isPrinting && (
        // This overlay portals straight onto document.body, outside the app
        // shell's own root div — so it doesn't inherit that root's
        // `pt-[env(safe-area-inset-top)]` etc. (App.tsx). Plain `top-4`/
        // `right-4` land 16px from the true edge of the screen, which on an
        // iPhone falls under the notch/Dynamic Island or Safari's own
        // floating chrome — exactly where touches don't reach. Adding the
        // safe-area inset back in here (this overlay's one and only fixed
        // interactive control) keeps Print reachable everywhere the app
        // shell already accounts for.
        <div className="fixed top-[calc(1rem_+_env(safe-area-inset-top))] right-[calc(1rem_+_env(safe-area-inset-right))] z-50 flex gap-2 print:hidden">
          <Button variant="secondary" onClick={printNow}>
            Print
          </Button>
          <Button
            variant="icon"
            aria-label="Close"
            className="h-9 w-9 rounded-full bg-surface/90 text-xl leading-none"
            onClick={onClose}
          >
            ×
          </Button>
        </div>
      )}
    </>,
    document.body,
  )
}
