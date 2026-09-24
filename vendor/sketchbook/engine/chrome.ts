import type { Binding, CoverOptions, PaperTexture } from '../types'

/* Everything that makes it a particular book rather than a stack of
   images: the paper's tooth, the binding, the cover. All drawn in CSS and
   inline SVG, so a student's repo carries no chrome assets. */

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s.replace(/\s+/g, ' '))}")`

/* ---------------------------------------------------------------- colour */

type RGB = [number, number, number]
let ctx: CanvasRenderingContext2D | null = null

/** Any CSS colour → [r, g, b]. */
export function rgb(css: string): RGB {
  ctx ??= document.createElement('canvas').getContext('2d')
  if (!ctx) return [128, 128, 128]
  ctx.fillStyle = '#000'
  ctx.fillStyle = css
  const v = String(ctx.fillStyle)
  if (v.startsWith('#')) return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)) as RGB
  const m = v.match(/[\d.]+/g) ?? ['128', '128', '128']
  return [+m[0], +m[1], +m[2]]
}
const hex = (c: RGB) => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * t) as RGB
const WHITE: RGB = [255, 255, 255]
const BLACK: RGB = [0, 0, 0]

/** Relative luminance, 0 (black) to 1 (white). */
export function luminance(css: string) {
  const [r, g, b] = rgb(css).map(v => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/* ----------------------------------------------------------------- paper */

const TOOTH: Record<Exclude<PaperTexture, 'none' | 'dotted' | 'grid'>, { f: number; o: number; a: number; s: number }> = {
  'cold-press': { f: 0.9, o: 4, a: 0.16, s: 0.55 },
  'hot-press': { f: 1.6, o: 2, a: 0.05, s: 0.35 },
  smooth: { f: 1.4, o: 2, a: 0.07, s: 0.4 },
  kraft: { f: 0.7, o: 4, a: 0.16, s: 0.6 },
}

/**
 * The paper surface as one tiling layer: tooth, plus a printed dot or line
 * grid for sketchbook papers. `dark` flips the marks light for dark paper.
 * Pattern papers tile relative to the page so the grid keeps its scale.
 */
export function grain(texture: PaperTexture, dark: boolean): { image: string; size: string } {
  if (texture === 'none') return { image: 'none', size: '220px 220px' }
  const tooth = TOOTH[texture === 'dotted' || texture === 'grid' ? 'hot-press' : texture]
  const ink = dark ? '255,255,255' : '40,60,80'
  const noise = `
    <filter id="n" x="0" y="0">
      <feTurbulence type="fractalNoise" baseFrequency="${tooth.f}" numOctaves="${tooth.o}" seed="7" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 ${dark ? 0.9 : 0.24}  0 0 0 0 ${dark ? 0.88 : 0.2}  0 0 0 0 ${dark ? 0.84 : 0.15}  0 0 0 ${tooth.s * 2.2} -${tooth.s * 0.9}"/>
    </filter>
    <rect width="220" height="220" filter="url(#n)" opacity="${tooth.a * 3}"/>`
  let marks = ''
  if (texture === 'dotted') {
    for (let y = 11; y < 220; y += 22) for (let x = 11; x < 220; x += 22) marks += `<circle cx="${x}" cy="${y}" r="1.25"/>`
    marks = `<g fill="rgba(${ink},${dark ? 0.3 : 0.32})">${marks}</g>`
  } else if (texture === 'grid') {
    for (let p = 0.5; p < 220; p += 22) marks += `M${p} 0V220M0 ${p}H220`
    marks = `<path d="${marks}" stroke="rgba(${ink},${dark ? 0.2 : 0.2})" stroke-width="0.8" fill="none"/>`
  }
  const image = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">${noise}${marks}</svg>`)
  // ten dots or squares across a page, whatever its size on screen
  const size = marks ? 'calc(var(--skb-page) * 0.5) calc(var(--skb-page) * 0.5)' : '220px 220px'
  return { image, size }
}

/* ----------------------------------------------------------------- cover */

/** Fibres and weave for the cover board. */
export function material(kind: NonNullable<CoverOptions['material']>): string {
  if (kind === 'cloth') {
    return svg(`<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6">
      <rect width="6" height="6" fill="none"/>
      <path d="M0 1.5h6M0 4.5h6" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
      <path d="M1.5 0v6M4.5 0v6" stroke="rgba(0,0,0,.09)" stroke-width="1"/>
    </svg>`)
  }
  const cfg = { kraft: [0.08, 0.22], leather: [0.5, 0.18], card: [1.2, 0.08] }[kind]
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <filter id="m"><feTurbulence type="fractalNoise" baseFrequency="${cfg[0]} ${kind === 'kraft' ? cfg[0] * 6 : cfg[0]}" numOctaves="4" seed="3"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${cfg[1] * 4} -${cfg[1]}"/></filter>
    <rect width="240" height="240" filter="url(#m)"/>
  </svg>`)
}

export function renderCover(c: CoverOptions): HTMLElement {
  const el = document.createElement('div')
  el.className = `skb-cover ${c.material ?? 'cloth'}`
  el.dataset.align = c.align ?? 'left'
  el.dataset.tone = luminance(c.color ?? '#2f3b35') > 0.45 ? 'light' : 'dark'
  if (c.image) {
    const art = document.createElement('div')
    art.className = 'skb-cover-art'
    art.style.backgroundImage = `url("${c.image}")`
    el.appendChild(art)
  }
  if (c.title || c.subtitle) {
    const label = document.createElement('div')
    label.className = 'skb-cover-label'
    if (c.title) {
      const title = document.createElement('p')
      title.className = 'skb-cover-title'
      title.textContent = c.title
      label.appendChild(title)
    }
    if (c.subtitle) {
      const sub = document.createElement('p')
      sub.className = 'skb-cover-sub'
      sub.textContent = c.subtitle
      label.appendChild(sub)
    }
    el.appendChild(label)
  }
  if (c.band) {
    const band = document.createElement('div')
    band.className = 'skb-band'
    band.style.background = c.band
    el.appendChild(band)
  }
  return el
}

/* --------------------------------------------------------------- binding */

export const bindingDefaults: Record<Binding, string> = {
  spiral: '#a9a59c',
  'wire-o': '#a9a59c',
  stitched: '#8a7b66',
  coptic: '#3b342c',
  glued: '#000000',
}

/** The spine hardware, laid over the fold. */
export function renderBinding(kind: Binding, g: { page: number; height: number }, color?: string): HTMLElement {
  const el = document.createElement('div')
  el.className = `skb-binding ${kind}`
  el.setAttribute('aria-hidden', 'true')
  const base = rgb(color || bindingDefaults[kind])
  const light = hex(mix(base, WHITE, 0.72)), mid = hex(base), dark = hex(mix(base, BLACK, 0.62))
  const metal = `<linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>`

  if (kind === 'spiral') {
    // one continuous coil: a loop per round hole
    el.style.backgroundImage = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20" preserveAspectRatio="none">
      <defs>${metal}</defs>
      <ellipse cx="7" cy="12.5" rx="2.6" ry="2" fill="rgba(30,24,16,.5)"/>
      <ellipse cx="33" cy="12.5" rx="2.6" ry="2" fill="rgba(30,24,16,.5)"/>
      <path d="M7.5 14.5 C 9 4.5, 31 4.5, 32.5 14.5" fill="none" stroke="rgba(20,14,6,.28)" stroke-width="3.2" transform="translate(1.2 1.8)"/>
      <path d="M7 12.5 C 8.5 2.5, 31.5 2.5, 33 12.5" fill="none" stroke="url(#w)" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`)
    el.style.setProperty('--loops', String(Math.max(6, Math.round(g.height / Math.max(14, g.page * 0.045)))))
  } else if (kind === 'wire-o') {
    // twin loops of thinner wire through square holes, set closer together
    const loop = (dy: number) => `
      <path d="M9 ${13 + dy} L10 ${6 + dy} Q10.6 ${3.4 + dy} 13.2 ${3.4 + dy} H26.8 Q29.4 ${3.4 + dy} 30 ${6 + dy} L31 ${13 + dy}" fill="none" stroke="rgba(20,14,6,.25)" stroke-width="1.8" transform="translate(0.9 1.4)"/>
      <path d="M9 ${13 + dy} L10 ${6 + dy} Q10.6 ${3.4 + dy} 13.2 ${3.4 + dy} H26.8 Q29.4 ${3.4 + dy} 30 ${6 + dy} L31 ${13 + dy}" fill="none" stroke="url(#w)" stroke-width="1.5" stroke-linecap="round"/>`
    el.style.backgroundImage = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20" preserveAspectRatio="none">
      <defs>${metal}</defs>
      <rect x="6.6" y="11" width="4.4" height="4.4" rx=".6" fill="rgba(30,24,16,.5)"/>
      <rect x="29" y="11" width="4.4" height="4.4" rx=".6" fill="rgba(30,24,16,.5)"/>
      ${loop(0)}${loop(2.6)}
    </svg>`)
    el.style.setProperty('--loops', String(Math.max(8, Math.round(g.height / Math.max(11, g.page * 0.036)))))
  } else if (kind === 'stitched') {
    el.style.setProperty('--skb-thread', mid)
  } else if (kind === 'coptic') {
    // exposed chain stitch: a few stations of thread wrapped over the spine
    const w = g.page * 0.12, h = g.height * 0.95
    const vh = (40 * h) / w
    const stations = Math.max(4, Math.min(7, Math.round(g.height / (g.page * 0.3))))
    let body = ''
    for (let i = 0; i < stations; i++) {
      const y = (vh * (i + 0.5)) / stations
      body += `
        <circle cx="13" cy="${y}" r="1.6" fill="rgba(30,24,16,.55)"/><circle cx="27" cy="${y}" r="1.6" fill="rgba(30,24,16,.55)"/>
        <path d="M13 ${y - 2.2} C16 ${y - 5.5}, 24 ${y - 5.5}, 27 ${y - 2.2}" />
        <path d="M13 ${y + 2.2} C16 ${y + 5.5}, 24 ${y + 5.5}, 27 ${y + 2.2}" />
        <path d="M13 ${y} C17 ${y - 1.4}, 23 ${y + 1.4}, 27 ${y}" />
        <path d="M13 ${y - 2.2} L11.4 ${y - 4.6} M27 ${y - 2.2} L28.6 ${y - 4.6} M13 ${y + 2.2} L11.4 ${y + 4.6} M27 ${y + 2.2} L28.6 ${y + 4.6}" />`
    }
    el.style.backgroundImage = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 ${vh.toFixed(1)}">
      ${body.match(/<circle[^>]*>/g)?.join('') ?? ''}
      <g fill="none" stroke="rgba(20,14,6,.22)" stroke-width="2.1" stroke-linecap="round" transform="translate(.5 .9)">${body.replace(/<circle[^>]*>/g, '')}</g>
      <g fill="none" stroke="${mid}" stroke-width="1.6" stroke-linecap="round">${body.replace(/<circle[^>]*>/g, '')}</g>
      <g stroke="${light}" stroke-width=".5" fill="none" opacity=".5">${body.replace(/<circle[^>]*>/g, '')}</g>
    </svg>`)
  }
  return el
}

/** How far the case (cover boards) reaches beyond the paper. */
export const rimFor = (page: number, hasCover: boolean) => (hasCover ? Math.max(4, Math.round(page * 0.022)) : 0)
