import { PNG } from 'pngjs';
import { promises as fs } from 'fs';
import path from 'path';

const SRC = path.resolve('src/assets/logos/ifpe-bloom-symbol-beige.png');
const OUT_DIR = path.resolve('scripts/out');

const YELLOW = { r: 0xf4, g: 0xc2, b: 0x1e };
const GREEN = { r: 0x6a, g: 0x7f, b: 0x4b };

function dist(r, g, b, target) {
  return Math.sqrt((r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2);
}

function makeMask(png, target, tolerance) {
  const mask = new PNG({ width: png.width, height: png.height });
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const isMatch = dist(r, g, b, target) <= tolerance;
      const v = isMatch ? 0 : 255; // black = shape, white = background
      mask.data[idx] = v;
      mask.data[idx + 1] = v;
      mask.data[idx + 2] = v;
      mask.data[idx + 3] = 255;
    }
  }
  return mask;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const buf = await fs.readFile(SRC);
  const png = PNG.sync.read(buf);
  console.log('image size', png.width, png.height);

  const seen = new Map();
  for (let y = 0; y < png.height; y += 3) {
    for (let x = 0; x < png.width; x += 3) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const key = `${r},${g},${b}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
  }
  const sorted = [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('top colours (r,g,b : count)');
  for (const [k, v] of sorted) console.log(' ', k, ':', v);

  const yellowMask = makeMask(png, YELLOW, 40);
  const greenMask = makeMask(png, GREEN, 40);

  await fs.writeFile(path.join(OUT_DIR, 'mask-yellow.png'), PNG.sync.write(yellowMask));
  await fs.writeFile(path.join(OUT_DIR, 'mask-green.png'), PNG.sync.write(greenMask));
  console.log('masks written to', OUT_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
