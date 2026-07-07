import imageCompression from 'browser-image-compression'

export interface CompressedImage {
  fileName: string
  contentType: string
  dataUrl: string
  sizeBytes: number
}

// A prescription photo only needs to stay legible, not archival-quality —
// capping the longest side is what actually shrinks a multi-MB phone photo
// down to something reasonable; the quality/size target below is what
// browser-image-compression uses to pick a JPEG quality that hits it.
const MAX_DIMENSION_PX = 1800
const MAX_SIZE_MB = 0.4

/** Downscales + re-encodes an image client-side before it's ever stored —
 *  runs in a Web Worker so compressing a large photo doesn't block the UI. */
export async function compressImageFile(file: File): Promise<CompressedImage> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_DIMENSION_PX,
    maxSizeMB: MAX_SIZE_MB,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed)
  return {
    fileName: file.name,
    contentType: compressed.type,
    dataUrl,
    sizeBytes: compressed.size,
  }
}

// A clinic logo only ever renders small (a header icon) or faint (a print
// watermark) — nowhere near the resolution a legible prescription photo
// needs — so it gets its own, much smaller target than compressImageFile.
// Kept as PNG rather than re-encoded to JPEG: logos are commonly a
// transparent-background graphic, and flattening that to JPEG would turn
// the transparent area into an opaque (usually white or black) box —
// especially bad once it's rendered faint as a watermark, where that box
// would show up as a ghostly rectangle behind the prescription text.
const LOGO_MAX_DIMENSION_PX = 800
const LOGO_MAX_SIZE_MB = 0.15

export async function compressLogoFile(file: File): Promise<CompressedImage> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: LOGO_MAX_DIMENSION_PX,
    maxSizeMB: LOGO_MAX_SIZE_MB,
    useWebWorker: true,
    fileType: 'image/png',
  })
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed)
  return {
    fileName: file.name,
    contentType: compressed.type,
    dataUrl,
    sizeBytes: compressed.size,
  }
}
