import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

// Extracted from the clinic's prescription card logo (see docs/design.md
// reference image) — a wide "OVC" mark (Ortho / Vision / Care), background
// already removed. See scripts/logo-source.png.
const logoSrc = path.join(root, 'scripts', 'logo-source.png');

async function makeIcon(name, size, fitFraction) {
  const boxSize = Math.round(size * fitFraction);
  const logo = await sharp(logoSrc)
    .resize(boxSize, boxSize, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: '#ffffff' },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .flatten({ background: '#ffffff' }) // fully opaque; alpha channel just adds bytes
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(outDir, name));
  console.log('wrote', name);
}

// "any" purpose icons: generous padding, white background.
await makeIcon('icon-512.png', 512, 0.8);
await makeIcon('icon-192.png', 192, 0.8);
await makeIcon('apple-touch-icon.png', 180, 0.78);
await makeIcon('favicon-32.png', 32, 0.9);
await makeIcon('favicon-16.png', 16, 0.9);

// "maskable" icons: keep content within the safe zone (the largest square
// inscribed in the circle any launcher mask crops to) — tighter fraction,
// full-bleed background to the edges.
await makeIcon('maskable-512.png', 512, 0.62);
await makeIcon('maskable-192.png', 192, 0.62);
