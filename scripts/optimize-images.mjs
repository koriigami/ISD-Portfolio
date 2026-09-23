// npm run images
//
// Shrinks every image in public/pages/ for the web: at most 2400 px on the
// long side, saved as WebP. Originals are moved to originals/ (not uploaded
// to your site) and portfolio.config.ts is updated to the new file names.
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { extname, join, basename } from 'node:path'
import sharp from 'sharp'

const PAGES = 'public/pages'
const ORIGINALS = 'originals'
const CONFIG = 'src/portfolio.config.ts'
const MAX = 2400
const TYPES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.avif'])

await mkdir(ORIGINALS, { recursive: true })
let config = await readFile(CONFIG, 'utf8')
let saved = 0

for (const file of (await readdir(PAGES)).sort()) {
  const ext = extname(file).toLowerCase()
  if (!TYPES.has(ext)) continue
  const src = join(PAGES, file)
  const name = basename(file, extname(file))
  const img = sharp(src)
  const { width = 0, height = 0 } = await img.metadata()
  const before = (await stat(src)).size
  const small = ext === '.webp' && Math.max(width, height) <= MAX && before < 900_000
  if (small) continue

  const out = join(PAGES, `${name}.webp`)
  const buf = await img.rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
  await rename(src, join(ORIGINALS, file))
  await writeFile(out, buf)
  saved += before - buf.length
  if (file !== `${name}.webp`) config = config.replaceAll(`/pages/${file}`, `/pages/${name}.webp`)
  console.log(`${file.padEnd(36)} ${(before / 1024).toFixed(0).padStart(6)} KB  →  ${name}.webp ${(buf.length / 1024).toFixed(0).padStart(5)} KB`)
}

await writeFile(CONFIG, config)
console.log(saved > 0 ? `\nSaved ${(saved / 1024 / 1024).toFixed(1)} MB. Originals are in ${ORIGINALS}/.` : 'Nothing to shrink — your images are already web-sized.')
