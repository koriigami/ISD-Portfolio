import type { SketchbookPage } from '../types'

/* The book as positions. Position 0 is the closed front cover (only when
   the book has one); position n ≥ 1 is the n-th opening in `pages`.

   Every position shows a left face L(n) and a right face R(n). A turn
   forward from n lifts R(n); its back is L(n+1). A turn back from n lifts
   L(n); its back is R(n-1). Those two rules are the whole book. */

export type Frame = 'page' | 'spread-left' | 'spread-right'

export type Face =
  | { kind: 'image'; src: string; frame: Frame; opening: number; alt: string }
  | { kind: 'blank'; opening: number }
  | { kind: 'cover' }

export class BookModel {
  readonly pages: SketchbookPage[]
  readonly hasCover: boolean

  constructor(pages: SketchbookPage[], hasCover: boolean) {
    this.pages = pages
    this.hasCover = hasCover
  }

  get count() { return this.pages.length }
  get min() { return this.hasCover ? 0 : 1 }
  get max() { return Math.max(this.min, this.count) }

  clamp(n: number) { return Math.max(this.min, Math.min(this.max, Math.round(n))) }

  left(n: number): Face | null {
    if (n < 1 || n > this.count) return null
    const p = this.pages[n - 1]
    if (p.spread) return { kind: 'image', src: p.spread, frame: 'spread-left', opening: n, alt: p.alt }
    if (p.left) return { kind: 'image', src: p.left, frame: 'page', opening: n, alt: p.alt }
    return { kind: 'blank', opening: n }
  }

  right(n: number): Face | null {
    if (n === 0) return this.hasCover ? { kind: 'cover' } : null
    if (n < 1 || n > this.count) return null
    const p = this.pages[n - 1]
    if (p.spread) return { kind: 'image', src: p.spread, frame: 'spread-right', opening: n, alt: p.alt }
    if (p.right) return { kind: 'image', src: p.right, frame: 'page', opening: n, alt: p.alt }
    return { kind: 'blank', opening: n }
  }

  page(n: number): SketchbookPage | undefined { return this.pages[n - 1] }

  /** Every image the openings near `n` need, nearest first. */
  around(n: number, reach = 2): string[] {
    const out: string[] = []
    for (let d = 0; d <= reach; d++) {
      for (const k of d === 0 ? [n] : [n + d, n - d]) {
        const p = this.page(k)
        if (!p) continue
        for (const s of [p.spread, p.left, p.right]) if (s && !out.includes(s)) out.push(s)
      }
    }
    return out
  }

  /** First opening that belongs to a project. */
  openingOf(slug: string): number | null {
    const i = this.pages.findIndex(p => p.project === slug)
    return i < 0 ? null : i + 1
  }
}
