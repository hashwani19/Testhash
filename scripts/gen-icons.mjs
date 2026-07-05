import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const icon = path.join(root, 'scripts', 'icon.svg');
const maskable = path.join(root, 'scripts', 'icon-maskable.svg');

const jobs = [
  [icon, 'icon-192.png', 192],
  [icon, 'icon-512.png', 512],
  [icon, 'apple-touch-icon.png', 180],
  [icon, 'favicon-32.png', 32],
  [icon, 'favicon-16.png', 16],
  [maskable, 'maskable-192.png', 192],
  [maskable, 'maskable-512.png', 512],
];

for (const [src, name, size] of jobs) {
  await sharp(src, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, name));
  console.log('wrote', name);
}
