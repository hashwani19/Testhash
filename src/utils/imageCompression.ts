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
