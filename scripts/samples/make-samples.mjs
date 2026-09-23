// Renders the SAMPLE portfolio pages in public/pages/ from samples.html.
// Maintainers only — students replace these with their own work.
//
//   NODE_PATH="$(npm root -g)" node scripts/samples/make-samples.mjs
//
// Needs Playwright (global install is fine) and sharp (a dev dependency).
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '../../public/pages')
await mkdir(out, { recursive: true })

const shots = {
  s01: '01-title', s02: '02-about', s03: '03-contents', s04: '04-cafe-title', s05: '05-cafe-materials',
  s06: '06-cafe-drawings', 's07-left': '07-cafe-sketch', 's07-right': '07-cafe-render', s08: '08-reading-room',
  s09: '09-reading-room-details', s10: '10-studies', s11: '11-thank-you',
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined })
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1300, height: 900 } })
await page.goto(pathToFileURL(join(here, 'samples.html')).href, { waitUntil: 'networkidle' })
// Offline? Point FONTSOURCE at a node_modules/@fontsource folder holding
// instrument-serif, inter and kalam, and the fonts load from disk instead.
if (process.env.FONTSOURCE) {
  const f = (pkg, file) => pathToFileURL(join(process.env.FONTSOURCE, pkg, 'files', file)).href
  const face = (family, pkg, file, weight, style = 'normal') =>
    `@font-face{font-family:'${family}';src:url(${f(pkg, file)}) format('woff2');font-weight:${weight};font-style:${style}}`
  await page.addStyleTag({ content: [
    face('Instrument Serif', 'instrument-serif', 'instrument-serif-latin-400-normal.woff2', 400),
    face('Instrument Serif', 'instrument-serif', 'instrument-serif-latin-400-italic.woff2', 400, 'italic'),
    ...[300, 400, 500, 600].map(w => face('Inter', 'inter', `inter-latin-${w}-normal.woff2`, w)),
    face('Kalam', 'kalam', 'kalam-latin-300-normal.woff2', 300),
    face('Kalam', 'kalam', 'kalam-latin-400-normal.woff2', 400),
  ].join('\n') })
}
await page.evaluate(async () => {
  await Promise.all(['Instrument Serif', 'Inter', 'Kalam'].flatMap(f => [`300 16px "${f}"`, `400 16px "${f}"`, `italic 400 16px "${f}"`, `500 16px "${f}"`, `600 16px "${f}"`].map(s => document.fonts.load(s))))
  await document.fonts.ready
})
for (const [id, name] of Object.entries(shots)) {
  const png = await page.locator(`#${id}`).screenshot({ type: 'png' })
  const file = join(out, `${name}.webp`)
  await sharp(png).webp({ quality: 80 }).toFile(file)
  const { size } = await sharp(file).metadata().then(m => ({ size: `${m.width}×${m.height}` }))
  console.log(`${name}.webp  ${size}`)
}
await browser.close()
