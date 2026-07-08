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

// Matches the string every other hardcoded "Ortho and Vision Care" surface
// still uses (LoginScreen, AppHeader, index.html) — this is the only one of
// the four that became admin-editable (docs/design.md §5.6); the other
// three are a separate, unimplemented "tenant branding" concept (§5.5).
const DEFAULT_CLINIC_NAME = 'Ortho and Vision Care'

// Chrome on Android has a known, version-dependent bug where window.print()
// inside an installed, standalone-display PWA (no address bar, no browser
// back button) renders a blank print preview with no way to dismiss it —
// standalone mode strips the browser chrome the print UI normally relies
// on. Detected so the auto-triggered print below can be skipped for this
// one combination — see the isAndroidStandalone usage further down.
function isAndroidStandaloneDisplay(): boolean {
  return /Android/i.test(navigator.userAgent) && window.matchMedia('(display-mode: standalone)').matches
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
  const skipAutoPrint = useRef(isAndroidStandaloneDisplay()).current
  // EyeRecordHistory passes onClose as a fresh inline arrow function on
  // every render — a ref keeps the effects below reading the latest
  // version without needing onClose in their dependency arrays, which
  // matters more here than it looks: an effect that re-runs on every
  // parent render is harmless when its cleanup only removes event
  // listeners, but the history effect just below calls history.back() in
  // its cleanup, and a spurious teardown from an unrelated parent
  // re-render would fire that for real, closing the overlay almost as
  // soon as it opened.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    // A hardware/gesture back button doesn't otherwise know about this
    // overlay — this app has no URL-based routing (App.tsx is one big
    // useState<View>), so without a history entry of our own, Android's
    // back button falls through past this screen entirely instead of
    // closing it. Consumed on any other close path too (Close button,
    // backdrop tap, print auto-close below) so it doesn't leave a dead
    // entry the user would otherwise have to press back through later.
    // Runs once on mount only — see the onCloseRef comment above.
    let closedViaPopState = false
    history.pushState({ prescriptionPrintOverlay: true }, '')
    const onPopState = () => {
      closedViaPopState = true
      onCloseRef.current()
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (!closedViaPopState && history.state?.prescriptionPrintOverlay) history.back()
    }
  }, [])

  useEffect(() => {
    // #root normally only gets hidden during actual printing (index.css's
    // @media print rule) — but it stays in normal document flow the whole
    // time this overlay is on screen, and index.css gives it a
    // `min-height: 100svh`. That pushes this component's own (non-fixed)
    // printed-page div below one full viewport height of empty flow space
    // every time, off the bottom of the screen — verified via a real
    // getBoundingClientRect check, not assumed: the card started at
    // y≈947px on a 915px-tall viewport. The fixed backdrop and controls
    // stay visible regardless of scroll, so the on-screen result was
    // exactly a blank-looking dimmed screen with no visible content unless
    // the user happened to scroll down. Hiding #root for as long as this
    // overlay is mounted — not just during the print media query — removes
    // that dead space so the printed page renders at the top where it's
    // actually seen.
    const root = document.getElementById('root')
    if (!root) return
    const previousDisplay = root.style.display
    root.style.display = 'none'
    return () => {
      root.style.display = previousDisplay
    }
  }, [])

  useEffect(() => {
    if (hasPrinted.current) return
    hasPrinted.current = true
    onPrinted()
    // Skipped for an installed, standalone-display PWA on Android (see
    // isAndroidStandaloneDisplay above) — instead of throwing the user
    // straight into a print preview that may render blank with no way out,
    // they land on this overlay's own Close-able UI first, and the visible
    // "Print" button (still present, still tappable) is an opt-in try
    // rather than something sprung on them.
    if (skipAutoPrint) return
    const id = requestAnimationFrame(() => window.print())
    return () => cancelAnimationFrame(id)
    // Runs once on mount only — onPrinted/onClose identity changes shouldn't re-trigger a print.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      onCloseRef.current()
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
    // Runs once on mount only — see the onCloseRef comment above.
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
          <header className="mb-4 flex items-start justify-between gap-4 border-b-2 border-black pb-3">
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

      <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-end gap-2 p-4 print:hidden">
        {skipAutoPrint && (
          <p className="w-full rounded-lg bg-medium px-3 py-2 text-left text-[13px] text-black shadow-card">
            Printing can show a blank screen on some Android devices when the app is installed to your
            home screen. If that happens, use your device's back button, then try printing again from
            this app in Chrome instead of the installed icon.
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
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
      </div>
    </>,
    document.body,
  )
}
