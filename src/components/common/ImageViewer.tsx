import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { dimmedBackdrop } from '../../styles'

export interface ViewerImage {
  src: string
  alt: string
}

interface Props {
  images: ViewerImage[]
  initialIndex: number
  onClose: () => void
}

/**
 * Full-screen image preview overlay. Every prescription photo in this
 * local-only build is a `data:` URL (§7 of docs/design.md — no R2/object
 * storage yet), and modern browsers block top-level navigation to a
 * `data:` URL from a click (`<a href target="_blank">` or `window.open`) —
 * it silently does nothing rather than opening. Rendering the image
 * in-page instead sidesteps that entirely, since it's never a navigation.
 *
 * Supports multiple images: a scroll-snap strip so touch/wheel scrolling
 * works natively, plus prev/next buttons and arrow-key navigation that stay
 * in sync with whatever the user scrolled to.
 */
export function ImageViewer({ images, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex)
  const trackRef = useRef<HTMLDivElement>(null)

  const goTo = (next: number) => {
    if (next < 0 || next >= images.length) return
    setIndex(next)
    trackRef.current?.scrollTo({ left: next * trackRef.current.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    // Jump to the clicked image without animating — it should open already there.
    trackRef.current?.scrollTo({ left: initialIndex * (trackRef.current.clientWidth ?? 0) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // The track only scrolls horizontally (one image per "page"), so without
    // this a vertical swipe over the viewer has nowhere to go and chains
    // through to whatever's scrollable behind it — the patient list/history
    // underneath. Lock the page in place for as long as the viewer is open.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goTo(index - 1)
      else if (e.key === 'ArrowRight') goTo(index + 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const handleScroll = () => {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    const nearest = Math.round(el.scrollLeft / el.clientWidth)
    if (nearest !== index) setIndex(nearest)
  }

  const current = images[index]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-5 ${dimmedBackdrop}`}
      role="dialog"
      aria-modal="true"
      aria-label={current?.alt}
      onClick={onClose}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        // No stopPropagation here: the track fills almost the entire dialog,
        // so swallowing its clicks would leave next to no "outside" area to
        // tap to close — tapping the track (image or backdrop within it)
        // closes the viewer same as tapping the padded edge. The prev/next/
        // close controls below stop their own click's propagation so they
        // don't also trigger this.
        className="flex h-full w-full touch-pan-x snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((img, i) => (
          <div key={i} className="flex h-full w-full shrink-0 snap-center items-center justify-center">
            <img src={img.src} alt={img.alt} className="max-h-full max-w-full rounded-xl object-contain shadow-card" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="icon"
            aria-label="Previous image"
            className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-surface/90 text-xl leading-none disabled:opacity-30"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation()
              goTo(index - 1)
            }}
          >
            ‹
          </Button>
          <Button
            variant="icon"
            aria-label="Next image"
            className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-surface/90 text-xl leading-none disabled:opacity-30"
            disabled={index === images.length - 1}
            onClick={(e) => {
              e.stopPropagation()
              goTo(index + 1)
            }}
          >
            ›
          </Button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-2.5 py-1 text-[12px] font-medium text-text">
            {index + 1} / {images.length}
          </span>
        </>
      )}

      <Button
        variant="icon"
        aria-label="Close image"
        className="absolute right-4 top-4 h-9 w-9 rounded-full bg-surface/90 text-xl leading-none"
        onClick={onClose}
      >
        ×
      </Button>
    </div>
  )
}
