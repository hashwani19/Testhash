import { useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import type { EyeRefraction, EyeVisit, Patient, PrescriptionTemplate } from '../types'
import { getPatientAge } from '../utils/age'
import { buildPrescriptionPdf, DEFAULT_CLINIC_NAME } from '../utils/prescriptionPdf'
import { Button } from './common/Button'
import { dimmedBackdrop } from '../styles'

interface Props {
  patient: Patient
  visit: EyeVisit
  template: PrescriptionTemplate
  onClose: () => void
  /** Called each time Print/Share is tapped, right before the print dialog
   *  or share sheet opens — the caller logs this as an export-class audit
   *  entry (docs/design.md §5.6/§10). */
  onPrinted: () => void
}

// iOS (any browser — all WebKit) and installed/standalone contexts can't use
// window.print(): the print dialog opens but its preview renders blank, a
// platform-level limitation. Those contexts build a PDF client-side instead
// and hand it to the native share sheet, whose AirPrint entry is the actual
// print path. Desktop keeps window.print(), which works there.
function isIosDevice() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    // iPadOS Safari reports itself as macOS; touch support tells it apart.
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  )
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
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
  // position: fixed elements have long-standing WebKit/Chromium print bugs —
  // display:none under @media print isn't reliably respected on them the
  // way it is on normal-flow elements. Rather than trust the CSS, printing
  // physically removes the backdrop/controls from the DOM (via flushSync,
  // so the removal commits before window.print() runs) instead of hiding
  // them.
  const [isPrinting, setIsPrinting] = useState(false)
  const restoreTimeoutRef = useRef<number | null>(null)
  const printNow = () => {
    onPrinted()
    flushSync(() => setIsPrinting(true))
    window.print()
    // window.print() has no callback/promise, so there's no way to know
    // whether it actually opened a print UI. If it didn't, none of the
    // afterprint/matchMedia/visibilitychange signals below ever fire to
    // restore the controls removed above — this timeout is a safety net,
    // not a detector, so the overlay is never stuck with no way to close
    // it. A successful print already unmounts via onClose() first, making
    // this a no-op in that case.
    restoreTimeoutRef.current = window.setTimeout(() => setIsPrinting(false), 1200)
  }

  // Built on mount rather than on tap so the Share tap handler stays fully
  // synchronous (navigator.share needs the same user-gesture activation
  // window.print() does).
  const usePdfExport = isIosDevice() || isStandaloneDisplay()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  useEffect(() => {
    if (!usePdfExport) return
    let cancelled = false
    buildPrescriptionPdf(patient, visit, template).then(
      (file) => {
        if (!cancelled) setPdfFile(file)
      },
      () => {
        // Generation failing leaves the button disabled; the on-screen
        // preview is still fully usable/readable.
      },
    )
    return () => {
      cancelled = true
    }
  }, [patient, visit, template, usePdfExport])

  const sharePdf = () => {
    if (!pdfFile) return
    onPrinted()
    const nav = window.navigator as Navigator & { canShare?: (data: ShareData) => boolean }
    if (typeof nav.share === 'function' && nav.canShare?.({ files: [pdfFile] })) {
      nav.share({ files: [pdfFile] }).catch((err: unknown) => {
        // AbortError is the user closing the sheet — not a failure.
        if ((err as Error)?.name !== 'AbortError') downloadFile(pdfFile)
      })
    } else {
      downloadFile(pdfFile)
    }
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
    // The overlay auto-closes once the print/share UI is dismissed
    // (printed or cancelled, either way) — three overlapping signals since
    // no single one fires reliably across every platform.
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

      {!isPrinting && (
        <div className={`fixed inset-0 z-50 print:hidden ${dimmedBackdrop}`} />
      )}

      <div
        className={
          isPrinting
            ? undefined
            : // Pins the printable content into the viewport the instant the
              // overlay opens (rather than sitting wherever normal document
              // flow puts it, after the whole #root app tree). Top padding
              // reserves space for the fixed Print/Close controls below so
              // they don't cover page content.
              'fixed inset-0 z-50 overflow-y-auto pt-[calc(5rem_+_env(safe-area-inset-top))]'
        }
        onClick={isPrinting ? undefined : (e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative z-50 mx-auto my-8 w-full max-w-[8.5in] bg-white p-8 text-[13px] text-black shadow-card print:m-0 print:w-auto print:max-w-none print:p-0 print:shadow-none">
          {template.logoDataUrl && (
            // Absolutely positioned and first in DOM order so every later
            // (normal-flow) sibling below paints on top of it automatically.
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

          {/* Own horizontal scroll container: this table's 9 columns don't
           * shrink below their content's natural width, which is wider than
           * a phone screen. print:overflow-visible since it always fits at
           * the actual printed page width. */}
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
        // This overlay portals onto document.body, outside the app shell's
        // root div, so it doesn't inherit the shell's safe-area padding
        // (App.tsx) — added back in here so these controls clear the iPhone
        // notch/Dynamic Island.
        <div className="fixed top-[calc(1rem_+_env(safe-area-inset-top))] right-[calc(1rem_+_env(safe-area-inset-right))] z-50 flex gap-2 print:hidden">
          {usePdfExport ? (
            <Button variant="secondary" disabled={!pdfFile} onClick={sharePdf}>
              {pdfFile ? 'Print / Share PDF' : 'Preparing PDF…'}
            </Button>
          ) : (
            <Button variant="secondary" onClick={printNow}>
              Print
            </Button>
          )}
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
