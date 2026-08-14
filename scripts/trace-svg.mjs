import potrace from 'potrace';
import { promises as fs } from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('scripts/out');

function traceFile(file) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      file,
      {
        threshold: 128,
        turdSize: 50,
        optCurve: true,
        optTolerance: 0.3,
      },
      (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      }
    );
  });
}

async function main() {
  const yellowSvg = await traceFile(path.join(OUT_DIR, 'mask-yellow.png'));
  const greenSvg = await traceFile(path.join(OUT_DIR, 'mask-green.png'));

  await fs.writeFile(path.join(OUT_DIR, 'yellow.svg'), yellowSvg);
  await fs.writeFile(path.join(OUT_DIR, 'green.svg'), greenSvg);

  // extract the path 'd' attribute
  const dY = yellowSvg.match(/ d="([^"]+)"/)?.[1] ?? '';
  const dG = greenSvg.match(/ d="([^"]+)"/)?.[1] ?? '';

  // split into subpaths at each "M" command (moveto starts a new contour)
  function splitSubpaths(d) {
    const parts = d.split(/(?=M)/g).map((s) => s.trim()).filter(Boolean);
    return parts;
  }

  const yParts = splitSubpaths(dY);
  const gParts = splitSubpaths(dG);

  console.log('yellow subpaths:', yParts.length);
  console.log('green subpaths:', gParts.length);

  await fs.writeFile(
    path.join(OUT_DIR, 'subpaths.json'),
    JSON.stringify({ yellow: yParts, green: gParts }, null, 2)
  );
  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
