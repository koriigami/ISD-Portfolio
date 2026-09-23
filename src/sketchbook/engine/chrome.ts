import type { Binding, CoverOptions, PaperTexture } from '../types'

/* Everything that makes it a particular book rather than a stack of
   images: the paper's tooth, the binding, the cover. All drawn in CSS and
   inline SVG, so a student's repo carries no chrome assets. */

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s.replace(/\s+/g, ' '))}")`

/** Paper tooth as a tiling noise. Returns a CSS background-image value. */
export function grain(texture: PaperTexture): string {
  if (texture === 'none') return 'none'
  const cfg = {
    'cold-press': { f: 0.9, o: 4, a: 0.16, s: 0.55 },
    smooth: { f: 1.4, o: 2, a: 0.07, s: 0.4 },
    kraft: { f: 0.55, o: 5, a: 0.26, s: 0.7 },
  }[texture]
  return svg(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <filter id="n" x="0" y="0">
      <feTurbulence type="fractalNoise" baseFrequency="${cfg.f}" numOctaves="${cfg.o}" seed="7" stitchTiles="stitch"/>
      <feColorMatrix values="0 0 0 0 0.24  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 ${cfg.s * 2.2} -${cfg.s * 0.9}"/>
    </filter>
    <rect width="220" height="220" filter="url(#n)" opacity="${cfg.a * 3}"/>
  </svg>`)
}

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
  if (c.image) {
    const art = document.createElement('div')
    art.className = 'skb-cover-art'
    art.style.backgroundImage = `url("${c.image}")`
    el.appendChild(art)
  }
  const label = document.createElement('div')
  label.className = 'skb-cover-label'
  const title = document.createElement('p')
  title.className = 'skb-cover-title'
  title.textContent = c.title
  label.appendChild(title)
  if (c.subtitle) {
    const sub = document.createElement('p')
    sub.className = 'skb-cover-sub'
    sub.textContent = c.subtitle
    label.appendChild(sub)
  }
  el.appendChild(label)
  if (c.band) {
    const band = document.createElement('div')
    band.className = 'skb-band'
    band.style.background = c.band
    el.appendChild(band)
  }
  return el
}

/** The spine hardware, laid over the fold. */
export function renderBinding(kind: Binding, loops: number): HTMLElement {
  const el = document.createElement('div')
  el.className = `skb-binding ${kind}`
  el.setAttribute('aria-hidden', 'true')
  if (kind === 'spiral') {
    // one wire loop per hole, drawn crossing the fold
    const coil = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 20" preserveAspectRatio="none">
      <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbfbf8"/><stop offset=".45" stop-color="#8d8a83"/><stop offset="1" stop-color="#34322e"/>
      </linearGradient></defs>
      <ellipse cx="7" cy="12.5" rx="2.6" ry="2" fill="rgba(30,24,16,.5)"/>
      <ellipse cx="33" cy="12.5" rx="2.6" ry="2" fill="rgba(30,24,16,.5)"/>
      <path d="M7.5 14.5 C 9 4.5, 31 4.5, 32.5 14.5" fill="none" stroke="rgba(20,14,6,.28)" stroke-width="3.2" transform="translate(1.2 1.8)"/>
      <path d="M7 12.5 C 8.5 2.5, 31.5 2.5, 33 12.5" fill="none" stroke="url(#w)" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`)
    el.style.backgroundImage = coil
    el.style.setProperty('--loops', String(loops))
  }
  return el
}

/** How far the case (cover boards) reaches beyond the paper. */
export const rimFor = (page: number, hasCover: boolean) => (hasCover ? Math.max(4, Math.round(page * 0.022)) : 0)
