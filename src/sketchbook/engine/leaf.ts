import type { Face } from './model'
import { paintFace, type Geometry } from './paint'

/* A turning leaf.

   Paper does not swing like a door: it bows. The leaf is built as a chain
   of narrow strips, each nested in the one before, so rotating a strip by a
   small angle relative to its parent bends everything beyond it. Bending is
   weighted towards the spine, where a lifted sheet flexes most, and fades
   out at both ends of the turn so the page lies flat when it lands.

   A board (the cover) is a single rigid strip. */

export type Dir = 'next' | 'prev'

export type LeafSpec = {
  dir: Dir
  front: Face | null
  back: Face | null
  strips: number
  /** Rigid, oversize cover board instead of paper. */
  board: boolean
}

type Strip = { el: HTMLElement; front: HTMLElement; back: HTMLElement }

const DEG = 180 / Math.PI

export class Leaf {
  readonly el: HTMLElement
  readonly spec: LeafSpec
  private strips: Strip[] = []
  private weights: number[] = []
  private width = 0

  constructor(spec: LeafSpec, g: Geometry, rim: number, renderCover: () => HTMLElement) {
    this.spec = spec
    const n = spec.board ? 1 : Math.max(2, spec.strips)
    const raw = Array.from({ length: n }, (_, i) => 1 - 0.55 * (n > 1 ? i / (n - 1) : 0))
    const sum = raw.reduce((a, b) => a + b, 0)
    this.weights = raw.map(w => w / sum)

    const root = document.createElement('div')
    root.className = `skb-leaf ${spec.dir}${spec.board ? ' board' : ''}`
    this.el = root

    const sw = spec.board ? g.page + rim : g.page / n
    this.width = sw
    let host = root
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div')
      el.className = 'skb-strip'
      el.style.width = `${sw}px`
      if (i === n - 1) el.classList.add('edge')
      const front = document.createElement('div')
      const back = document.createElement('div')
      front.className = 'skb-face skb-front'
      back.className = 'skb-face skb-back'
      el.append(front, back)
      host.appendChild(el)
      host = el
      this.strips.push({ el, front, back })

      if (spec.board) {
        this.dressBoard(front, spec.front, g, rim, renderCover)
        this.dressBoard(back, spec.back, g, rim, renderCover)
      } else {
        // Which part of each page this strip carries. Faces on the right
        // page count out from the fold; faces on the left count in to it.
        const rightX = i * sw
        const leftX = g.page - (i + 1) * sw
        const next = spec.dir === 'next'
        paintFace(front, spec.front, g, next ? rightX : leftX)
        paintFace(back, spec.back, g, next ? leftX : rightX)
      }
    }
  }

  private dressBoard(el: HTMLElement, face: Face | null, g: Geometry, rim: number, renderCover: () => HTMLElement) {
    el.classList.add('skb-board-face')
    if (face?.kind === 'cover') {
      el.classList.add('skb-cover-face')
      el.appendChild(renderCover())
      return
    }
    // Inside of the board: cloth turn-ins around the first page.
    el.classList.add('skb-lining')
    const paper = document.createElement('div')
    paper.className = 'skb-face skb-lining-paper'
    paper.style.cssText = `left:${rim}px;top:${rim}px;width:${g.page}px;height:${g.height}px`
    paintFace(paper, face, g, 0)
    el.appendChild(paper)
  }

  /**
   * Pose the leaf at progress t ∈ [0, 1] with a given amount of bow.
   * Returns where the free edge lands, in px from the fold (positive = over
   * the right page), so the pages beneath can take its shadow.
   */
  pose(t: number, bow: number): number {
    const theta = Math.PI * t
    const beta = this.spec.board ? 0 : bow * Math.sin(Math.PI * t)
    const w = this.weights
    const n = w.length
    const angles: number[] = new Array(n)
    let acc = 0
    for (let i = 0; i < n; i++) {
      angles[i] = theta + beta * (1 - 2 * (acc + w[i] / 2))
      acc += w[i]
    }
    const sign = this.spec.dir === 'next' ? -1 : 1
    this.el.style.transform = `rotateY(${(sign * angles[0] * DEG).toFixed(3)}deg)`

    let reach = 0
    for (let i = 0; i < n; i++) {
      const s = this.strips[i]
      if (i > 0) {
        const rel = angles[i] - angles[i - 1]
        s.el.style.transform = `rotateY(${(sign * rel * DEG).toFixed(3)}deg)`
      }
      reach += this.width * Math.cos(angles[i])
      // light at the strip's two edges, so the shading runs smoothly
      // across the whole sheet instead of stepping strip by strip
      const a = i === 0 ? angles[0] : (angles[i - 1] + angles[i]) / 2
      const b = i === n - 1 ? angles[i] : (angles[i] + angles[i + 1]) / 2
      light(s, a, b, this.spec.dir)
    }
    return this.spec.dir === 'next' ? reach : -reach
  }
}

function shadeOf(angle: number) {
  const facing = Math.abs(Math.cos(angle))
  return 0.58 * Math.pow(1 - facing, 1.15)
}
function glossOf(angle: number) {
  const facing = Math.abs(Math.cos(angle))
  return 0.2 * Math.exp(-((facing - 0.8) ** 2) / 0.008)
}

function light(s: Strip, near: number, far: number, dir: Dir) {
  // In each face's own coordinates, which edge is nearer the spine?
  // next-front and prev-back read spine → edge; the other two are mirrored.
  const setFace = (el: HTMLElement, spineFirst: boolean) => {
    const [l, r] = spineFirst ? [near, far] : [far, near]
    el.style.setProperty('--sa', shadeOf(l).toFixed(3))
    el.style.setProperty('--sb', shadeOf(r).toFixed(3))
    el.style.setProperty('--ga', glossOf(l).toFixed(3))
    el.style.setProperty('--gb', glossOf(r).toFixed(3))
  }
  setFace(s.front, dir === 'next')
  setFace(s.back, dir === 'prev')
}
