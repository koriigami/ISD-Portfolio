import type { Face } from './model'

/* Paints a face (or a vertical slice of one) as CSS backgrounds.

   Images are fitted inside their frame: a single page, or the whole
   two-page spread for images that cross the fold. A slice only
   moves the background, so one image can be cut into any number of strips
   and still line up to the pixel. */

export type Geometry = { page: number; height: number; fit: 'contain' | 'cover' }

const sizes = new Map<string, { w: number; h: number }>()
const pending = new Map<string, Promise<void>>()

/** Load (and decode) an image once, remembering its natural size. */
export function load(src: string): Promise<void> {
  const known = pending.get(src)
  if (known) return known
  const p = new Promise<void>(resolve => {
    const im = new Image()
    im.decoding = 'async'
    im.onload = () => {
      sizes.set(src, { w: im.naturalWidth, h: im.naturalHeight })
      const done = () => resolve()
      if (im.decode) im.decode().then(done, done)
      else done()
    }
    im.onerror = () => resolve()
    im.src = src
  })
  pending.set(src, p)
  return p
}

export const isLoaded = (src: string) => sizes.has(src)

/* "contain" shows the whole image with paper around it; "cover" fills the
   page and trims whatever doesn't fit. */
function fit(src: string, fw: number, fh: number, mode: Geometry['fit']) {
  const s = sizes.get(src)
  const ar = s ? s.w / s.h : fw / fh
  let w = fw, h = fw / ar
  if (mode === 'cover' ? h < fh : h > fh) { h = fh; w = fh * ar }
  return { w, h, x: (fw - w) / 2, y: (fh - h) / 2 }
}

/**
 * Paint `face` onto `el`, showing the part of the page from `x0` (px from
 * the page's own left edge) across the element's width.
 */
export function paintFace(el: HTMLElement, face: Face | null, g: Geometry, x0 = 0) {
  el.dataset.kind = face ? face.kind : 'none'
  if (!face || face.kind !== 'image') {
    el.style.backgroundImage = ''
    el.style.backgroundSize = ''
    el.style.backgroundPosition = ''
    return
  }
  const wide = face.frame !== 'page'
  const frameW = wide ? g.page * 2 : g.page
  const offset = face.frame === 'spread-right' ? g.page : 0
  const f = fit(face.src, frameW, g.height, g.fit)
  el.style.backgroundImage = `var(--skb-grain), url("${face.src}")`
  el.style.backgroundSize = `var(--skb-grain-size), ${f.w.toFixed(1)}px ${f.h.toFixed(1)}px`
  el.style.backgroundPosition = `${(-x0).toFixed(1)}px 0, ${(f.x - offset - x0).toFixed(1)}px ${f.y.toFixed(1)}px`
}
