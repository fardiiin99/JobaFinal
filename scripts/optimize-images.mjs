/**
 * One-off: copy the legacy storefront's images into public/ at a size
 * a phone can actually download.
 *
 * The originals are unusable as shipped — hero-saree-drape.png is 8 MB
 * and hibiscus.png is 2.3 MB for a graphic rendered at 42x42 px. That
 * was ~10 MB on first paint for a mobile-first Bangladeshi store.
 *
 *   node scripts/optimize-images.mjs
 */
import { readdir, mkdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "src/images";
const OUT = "public/images";

/* Rendered size drives the cap, not the source resolution.
   The hero is full-bleed; the flower is a 42px icon. */
const MAX_WIDTH = { "hibiscus.png": 96, "jobalogo.png": 240 };
const DEFAULT_MAX_WIDTH = 1600;

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = await readdir(SRC);

  let before = 0;
  let after = 0;

  for (const file of files) {
    const from = path.join(SRC, file);
    const ext = path.extname(file).toLowerCase();
    const original = (await stat(from)).size;
    before += original;

    // SVGs are already tiny and lose their scalability if rasterised.
    if (ext === ".svg") {
      await copyFile(from, path.join(OUT, file));
      after += original;
      console.log(`  copy   ${file.padEnd(30)} ${kb(original)}`);
      continue;
    }

    // Everything raster becomes WebP: far smaller at equal quality, and
    // universally supported by the browsers this store sees.
    const out = path.join(OUT, `${path.basename(file, ext)}.webp`);
    const width = MAX_WIDTH[file] ?? DEFAULT_MAX_WIDTH;

    await sharp(from)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(out);

    const size = (await stat(out)).size;
    after += size;
    const saved = ((1 - size / original) * 100).toFixed(0);
    console.log(
      `  webp   ${file.padEnd(30)} ${kb(original).padStart(8)} -> ${kb(size).padStart(8)}  (-${saved}%)`,
    );
  }

  console.log(`\n  total  ${kb(before)} -> ${kb(after)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
