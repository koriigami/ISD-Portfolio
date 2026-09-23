import { clamp } from './motion'

/* A magnifying glass that lies on the desk beside the book.

   The glass itself never moves with the book's tilt or zoom; what you see
   through it is a copy of the flat, resting spread, scaled about the point
   beneath the glass. The copy is taken only when the book is at rest; while
   a leaf is turning the glass shows plain desk, so it never has to move out
   of the way. */

export type LoupeHost = {
  /** Book size in its own (unscaled) pixels. */
  size(): { w: number; h: number }
  zoom(): number
  /** Horizontal offset of the book (the closed book slides over). */
  shift(): number
  /** Elements to copy under the glass. */
  flatLayers(): HTMLElement[]
}

const MAG = 2.4

export class Loupe {
  private x: number | null = null
  private y = 0
  private grab: { px: number; py: number; x: number; y: number } | null = null
  private on = true
  private showing = false
  private readonly el: HTMLElement
  private readonly wrap: HTMLElement
  private readonly inner: HTMLElement
  private readonly host: LoupeHost

  constructor(el: HTMLElement, wrap: HTMLElement, inner: HTMLElement, host: LoupeHost) {
    this.el = el
    this.wrap = wrap
    this.inner = inner
    this.host = host
    el.addEventListener('pointerdown', this.down)
    el.addEventListener('pointermove', this.move)
    el.addEventListener('pointerup', this.up)
    el.addEventListener('pointercancel', this.up)
  }

  destroy() {
    this.el.removeEventListener('pointerdown', this.down)
    this.el.removeEventListener('pointermove', this.move)
    this.el.removeEventListener('pointerup', this.up)
    this.el.removeEventListener('pointercancel', this.up)
  }

  get enabled() { return this.on }

  setEnabled(on: boolean) {
    this.on = on
    this.el.classList.toggle('on', on && this.showing)
    if (on && this.x === null) this.rest()
    this.place()
  }

  /** The book is at rest (or not): refresh the copy under the glass. */
  sync(atRest: boolean) {
    this.showing = atRest
    this.el.classList.toggle('on', this.on && atRest)
    this.inner.textContent = ''
    if (atRest) for (const l of this.host.flatLayers()) this.inner.appendChild(l.cloneNode(true))
    this.place()
  }

  private radius() {
    const { w } = this.host.size()
    return clamp(w * 0.105, 70, 128)
  }

  /** Park the glass on the lower right corner of the book. It stays put
   *  while pages turn beneath it; the copy under it just goes blank. */
  rest() {
    const { w, h } = this.host.size()
    const r = this.radius()
    this.x = w - r * 1.05
    this.y = h - r * 0.5
    this.place()
  }

  place() {
    if (this.x === null) return
    const r = this.radius()
    const { w, h } = this.host.size()
    const z = this.host.zoom()
    const lx = this.x, ly = this.y
    this.el.style.setProperty('--r', `${r}px`)
    this.el.style.transform = `translate3d(${(lx - r).toFixed(1)}px, ${(ly - r).toFixed(1)}px, 0)`

    // fade the copy out as the glass leaves the paper
    const cx = w / 2, cy = h / 2, s = this.host.shift()
    const x0 = cx + (0 + s - cx) * z, x1 = cx + (w + s - cx) * z
    const y0 = cy + (0 - cy) * z, y1 = cy + (h - cy) * z
    const inside = Math.min(lx - x0, x1 - lx, ly - y0, y1 - ly)
    const k = this.on && this.showing ? clamp((inside + r * 0.35) / (r * 0.6), 0, 1) : 0
    this.wrap.style.opacity = k.toFixed(3)
    if (k <= 0.002) return
    const lens = r * 0.9
    const mask = `radial-gradient(circle ${lens.toFixed(1)}px at ${lx.toFixed(1)}px ${ly.toFixed(1)}px, #000 calc(100% - 1px), transparent 100%)`
    this.wrap.style.maskImage = mask
    this.wrap.style.webkitMaskImage = mask
    // the book point under the glass, then magnified about that same point
    const px = cx + (lx - cx) / z - s, py = cy + (ly - cy) / z
    const m = MAG * z
    this.inner.style.transform = `translate(${(lx - px * m).toFixed(1)}px, ${(ly - py * m).toFixed(1)}px) scale(${m.toFixed(4)})`
  }

  private down = (e: PointerEvent) => {
    if (!this.on || e.button !== 0 || this.x === null) return
    e.preventDefault()
    e.stopPropagation()
    this.grab = { px: e.clientX, py: e.clientY, x: this.x, y: this.y }
    this.el.classList.add('held')
    this.el.setPointerCapture(e.pointerId)
  }

  private move = (e: PointerEvent) => {
    if (!this.grab) return
    const { w, h } = this.host.size()
    const r = this.radius()
    this.x = clamp(this.grab.x + e.clientX - this.grab.px, -r * 0.6, w + r * 0.6)
    this.y = clamp(this.grab.y + e.clientY - this.grab.py, -r * 0.6, h + r * 0.9)
    this.place()
  }

  private up = () => {
    this.grab = null
    this.el.classList.remove('held')
  }
}
