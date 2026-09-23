import type { BookOptions, SketchbookEvent, SketchbookPage, SketchbookProject } from '../types'
import { grain, material, renderBinding, renderCover, rimFor } from './chrome'
import { Leaf, type Dir } from './leaf'
import { Loupe } from './loupe'
import { BookModel, type Face } from './model'
import { clamp, easeInOut, easeOutish, linear, spring, tween, type Motion } from './motion'
import { isLoaded, load, paintFace, type Geometry } from './paint'

/* The sketchbook engine. React renders an empty skeleton once; from then
   on this class owns the book's DOM and animates it by writing inline
   styles and CSS variables, never by re-rendering. */

export type ResolvedOptions = Required<Omit<BookOptions, 'cover'>> & { cover: BookOptions['cover'] }

export const defaults: ResolvedOptions = {
  pageShape: 'portrait',
  binding: 'stitched',
  paper: '#f2ede3',
  paperTexture: 'cold-press',
  printOnPaper: true,
  cover: false,
  ribbon: false,
  intro: true,
  openAt: 1,
  loupe: true,
  captions: true,
  tabs: true,
  maxHeight: '72vh',
}

const SHAPE: Record<ResolvedOptions['pageShape'], number> = {
  portrait: Math.SQRT1_2,
  square: 1,
  landscape: Math.SQRT2,
}

export type EngineCallbacks = {
  onEvent?: (e: SketchbookEvent) => void
  onPageClick?: (opening: number, side: 'left' | 'right') => void
  onChange?: (opening: number) => void
}

type Turn = {
  dir: Dir
  from: number
  to: number
  t: number
  leaf: Leaf
  motion: Motion | null
  target: 0 | 1
  /** Part of a riffle: no events, no URL updates. */
  quiet: boolean
}

type Parts = {
  root: HTMLElement
  stage: HTMLElement
  box: HTMLElement
  tilt: HTMLElement
  book: HTMLElement
  zoomWrap: HTMLElement
  zoomInner: HTMLElement
  loupe: HTMLElement
  captions: HTMLElement
  counter: HTMLElement
  zoomRead: HTMLElement
  live: HTMLElement
  probe: HTMLElement
}

const q = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`[data-skb="${name}"]`)!

export class SketchbookEngine {
  private o: ResolvedOptions
  private model: BookModel
  private projects: SketchbookProject[]
  private cb: EngineCallbacks
  private p: Parts
  private g: Geometry = { page: 0, height: 0 }
  private rim = 0
  private pos: number
  private turn: Turn | null = null
  private queue: { target: number; quiet: boolean } | null = null
  private riffling = false
  private drag: {
    id: number; x0: number; y0: number; at: number; moved: boolean; side: 'left' | 'right'
    t0: number; vel: number; last: number; lastT: number; blocked: boolean
  } | null = null
  private bow = 0.62
  private view = { rx: 0, ry: 0, z: 1, trx: 0, try: 0, tz: 1 }
  private raf: number | null = null
  private lastFrame = 0
  private loupe: Loupe
  private reduced: boolean
  private visible = true
  private destroyed = false
  private observers: { disconnect(): void }[] = []
  private caps: { out: HTMLElement | null; in: HTMLElement | null } = { out: null, in: null }

  constructor(root: HTMLElement, pages: SketchbookPage[], book: BookOptions | undefined, projects: SketchbookProject[], cb: EngineCallbacks) {
    this.o = { ...defaults, ...book }
    this.model = new BookModel(pages, !!this.o.cover)
    this.projects = projects
    this.cb = cb
    this.p = {
      root,
      stage: q(root, 'stage'),
      box: q(root, 'box'),
      tilt: q(root, 'tilt'),
      book: q(root, 'book'),
      zoomWrap: q(root, 'zoom'),
      zoomInner: q(root, 'zoom-inner'),
      loupe: q(root, 'loupe'),
      captions: q(root, 'captions'),
      counter: q(root, 'counter'),
      zoomRead: q(root, 'zoom-read'),
      live: q(root, 'live'),
      probe: q(root, 'probe'),
    }
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    const fromHash = this.hashOpening()
    this.pos = fromHash ?? this.model.min
    this.applyTheme()

    this.loupe = new Loupe(this.p.loupe, this.p.zoomWrap, this.p.zoomInner, {
      size: () => ({ w: this.g.page * 2, h: this.g.height }),
      zoom: () => this.view.z,
      shift: () => this.shiftFor(this.pos, null),
      flatLayers: () => [...this.p.book.querySelectorAll<HTMLElement>('.skb-base, .skb-board')],
    })
    this.loupe.setEnabled(this.o.loupe && !matchMedia('(pointer: coarse)').matches)

    this.layout()
    this.bind()
    this.boot(fromHash !== null)
  }

  /* ------------------------------------------------------------- setup */

  private applyTheme() {
    const r = this.p.root
    r.dataset.shape = this.o.pageShape
    r.dataset.binding = this.o.binding
    r.dataset.texture = this.o.paperTexture
    r.dataset.cover = this.o.cover ? 'yes' : 'no'
    r.classList.toggle('skb-print', this.o.printOnPaper)
    r.style.setProperty('--skb-paper', this.o.paper)
    r.style.setProperty('--skb-grain', grain(this.o.paperTexture))
    r.style.setProperty('--skb-max-h', this.o.maxHeight)
    if (this.o.cover) {
      r.style.setProperty('--skb-board', this.o.cover.color ?? '#2f3b35')
      r.style.setProperty('--skb-cover-ink', this.o.cover.ink ?? '#efe6d2')
      r.style.setProperty('--skb-cover-texture', material(this.o.cover.material ?? 'cloth'))
    }
    if (this.o.ribbon) r.style.setProperty('--skb-ribbon', this.o.ribbon)
  }

  private layout = () => {
    const stageW = this.p.stage.clientWidth
    const arrows = [...this.p.stage.querySelectorAll<HTMLElement>('.skb-arrow')]
      .reduce((a, el) => a + (el.offsetParent ? el.offsetWidth : 0), 0)
    const maxH = this.p.probe.offsetHeight || window.innerHeight * 0.7
    const aspect = SHAPE[this.o.pageShape] * 2
    const room = stageW - arrows - 8
    let w = Math.min(room / (1 + (this.o.cover ? 0.05 : 0) + (this.o.tabs && this.projects.length ? 0.05 : 0)), maxH * aspect)
    w = Math.max(200, Math.floor(w / 2) * 2)
    const h = Math.round(w / aspect)
    if (w / 2 === this.g.page && h === this.g.height) return
    this.g = { page: w / 2, height: h }
    this.rim = rimFor(w / 2, !!this.o.cover)
    const s = this.p.root.style
    s.setProperty('--skb-w', `${w}px`)
    s.setProperty('--skb-h', `${h}px`)
    s.setProperty('--skb-page', `${w / 2}px`)
    s.setProperty('--skb-rim', `${this.rim}px`)
    this.render()
    this.loupe.rest()
  }

  private async boot(deepLinked: boolean) {
    // first things first: the cover and the openings the intro will show
    const first = this.model.around(this.pos || 1, 1)
    await Promise.all(first.map(load))
    if (this.destroyed) return
    this.render()
    this.p.root.dataset.ready = 'yes'
    const land = this.model.clamp(this.o.openAt)
    if (!deepLinked && this.o.intro) {
      const introSet = this.model.around(1, Math.max(2, land))
      await Promise.race([Promise.all(introSet.map(load)), new Promise(r => setTimeout(r, 2500))])
      if (this.destroyed || this.turn || this.pos !== this.model.min) return
      await new Promise(r => setTimeout(r, this.o.cover ? 500 : 250))
      if (this.destroyed || this.turn || this.pos !== this.model.min) return
      this.goTo(land, true)
    }
    // then everything else, quietly
    const rest = this.model.around(this.pos || 1, this.model.count)
    for (const src of rest) { if (this.destroyed) return; await load(src) }
  }

  private bind() {
    const st = this.p.stage
    st.addEventListener('pointerdown', this.onDown)
    st.addEventListener('pointermove', this.onMove)
    st.addEventListener('pointerup', this.onUp)
    st.addEventListener('pointercancel', this.onCancel)
    st.addEventListener('dragstart', prevent)
    window.addEventListener('pointermove', this.onHover, { passive: true })
    window.addEventListener('pointerout', this.onOut)
    window.addEventListener('blur', this.onLeave)
    window.addEventListener('keydown', this.onKey)
    window.addEventListener('hashchange', this.onHash)
    const ro = new ResizeObserver(() => this.layout())
    ro.observe(this.p.stage)
    const io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting }, { threshold: 0.25 })
    io.observe(this.p.root)
    this.observers.push(ro, io)
  }

  destroy() {
    this.destroyed = true
    const st = this.p.stage
    st.removeEventListener('pointerdown', this.onDown)
    st.removeEventListener('pointermove', this.onMove)
    st.removeEventListener('pointerup', this.onUp)
    st.removeEventListener('pointercancel', this.onCancel)
    st.removeEventListener('dragstart', prevent)
    window.removeEventListener('pointermove', this.onHover)
    window.removeEventListener('pointerout', this.onOut)
    window.removeEventListener('blur', this.onLeave)
    window.removeEventListener('keydown', this.onKey)
    window.removeEventListener('hashchange', this.onHash)
    this.observers.forEach(o => o.disconnect())
    this.loupe.destroy()
    if (this.raf !== null) cancelAnimationFrame(this.raf)
    this.p.book.textContent = ''
  }

  /* ---------------------------------------------------------- building */

  private face(el: HTMLElement, face: Face | null, x0 = 0) {
    paintFace(el, face, this.g, x0)
    if (face?.kind === 'image' && !isLoaded(face.src)) {
      // repaint once the true proportions are known
      load(face.src).then(() => { if (!this.destroyed && el.isConnected) paintFace(el, face, this.g, x0) })
    }
  }

  /** Rebuild the book for the current state. Not called per frame. */
  private render() {
    if (!this.g.page) return
    const b = this.p.book
    b.textContent = ''
    const m = this.model
    const t = this.turn
    const n = this.pos

    // what lies flat underneath
    let leftFace: Face | null, rightFace: Face | null
    let leftOpening: number, rightOpening: number
    if (t) {
      leftOpening = t.dir === 'next' ? t.from : t.to
      rightOpening = t.dir === 'next' ? t.to : t.from
    } else {
      leftOpening = rightOpening = n
    }
    leftFace = m.left(leftOpening)
    rightFace = m.right(rightOpening)
    // the closed book rests with its cover as a flat, unturned leaf
    let leaf = t?.leaf ?? null
    if (!t && n === 0) {
      leaf = this.makeLeaf('next', 0)
      rightFace = m.right(1)
    }

    const S = m.count
    if (this.o.cover) {
      if (leftFace) b.appendChild(div('skb-board left'))
      b.appendChild(div('skb-board right'))
    }
    const pages = Math.max(1, S - 1)
    const thick = (leaves: number) => clamp(leaves / pages, 0, 1) * Math.max(2, this.g.page * 0.014)
    if (leftFace) b.appendChild(this.block('left', thick(leftOpening - 1)))
    if (rightFace) b.appendChild(this.block('right', thick(S - rightOpening)))

    for (const [side, f] of [['left', leftFace], ['right', rightFace]] as const) {
      if (!f) continue
      const el = div(`skb-face skb-base ${side}`)
      this.face(el, f)
      el.appendChild(div('skb-cast'))
      b.appendChild(el)
    }

    if (leftFace || rightFace || n === 0) {
      const loops = Math.max(6, Math.round(this.g.height / Math.max(14, this.g.page * 0.045)))
      b.appendChild(renderBinding(this.o.binding, loops))
    }
    if (this.o.ribbon && (n > 0 || t)) b.appendChild(div('skb-ribbon'))
    if (leaf) b.appendChild(leaf.el)
    if (this.o.tabs) this.renderTabs(b, t ? t.from : n)

    this.p.root.dataset.closed = !t && n === 0 ? 'yes' : 'no'
    this.p.root.dataset.turning = t ? 'yes' : 'no'
    this.setShift(t ? this.shiftFor(t.from, t) : this.shiftFor(n, null))
    if (t) this.pose()
    else if (leaf) leaf.pose(0, 0)
    this.renderCaption()
    this.renderCounter()
    this.loupe.sync(!t && n > 0)
    this.preload()
  }

  private block(side: 'left' | 'right', px: number) {
    const el = div(`skb-block ${side}`)
    const layers = Math.round(px)
    const dir = side === 'left' ? -1 : 1
    const sh: string[] = []
    for (let i = 1; i <= layers; i++) {
      const dark = i % 2 === 0
      sh.push(`${dir * i}px ${i * 0.55}px 0 ${dark ? 'var(--skb-edge-dark)' : 'var(--skb-edge)'}`)
    }
    // and the soft shadow the whole block casts on the desk
    sh.push('0 1px 2px rgba(40,28,14,.16)', `0 ${Math.round(this.g.height * 0.035)}px ${Math.round(this.g.height * 0.07)}px -${Math.round(this.g.height * 0.03)}px rgba(40,28,14,.45)`)
    el.style.boxShadow = sh.join(',')
    return el
  }

  private renderTabs(b: HTMLElement, at: number) {
    const list = this.projects
      .map(p => ({ p, n: this.model.openingOf(p.slug) }))
      .filter((x): x is { p: SketchbookProject; n: number } => x.n !== null)
    if (!list.length) return
    const wrap = div('skb-tabs')
    const count = list.length
    list.forEach(({ p, n }, i) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = `skb-tab ${n <= at && at > 0 ? 'left' : 'right'}`
      btn.style.setProperty('--i', String(i))
      btn.style.setProperty('--count', String(count))
      if (p.color) btn.style.setProperty('--tab', p.color)
      btn.title = p.title
      btn.setAttribute('aria-label', `Go to ${p.title}`)
      const label = document.createElement('span')
      label.textContent = String(i + 1).padStart(2, '0')
      btn.appendChild(label)
      btn.addEventListener('click', () => this.goTo(n))
      wrap.appendChild(btn)
    })
    b.appendChild(wrap)
  }

  private makeLeaf(dir: Dir, from: number): Leaf {
    const m = this.model
    const to = dir === 'next' ? from + 1 : from - 1
    const front = dir === 'next' ? m.right(from) : m.left(from)
    const back = dir === 'next' ? m.left(to) : m.right(to)
    const board = (dir === 'next' && from === 0) || (dir === 'prev' && to === 0)
    const leaf = new Leaf(
      { dir, front, back, board, strips: this.g.page < 260 ? 10 : 16 },
      this.g,
      this.rim,
      () => renderCover(this.o.cover || { title: '' }),
    )
    // late-arriving images: repaint the strips' slices
    for (const f of [front, back]) {
      if (f?.kind === 'image' && !isLoaded(f.src)) {
        load(f.src).then(() => {
          if (this.destroyed || this.turn?.leaf !== leaf) return
          this.turn.leaf = this.makeLeaf(dir, from)
          this.render()
        })
      }
    }
    return leaf
  }

  private preload() {
    for (const src of this.model.around(this.pos || 1, 2)) load(src)
  }

  /* ------------------------------------------------------------ posing */

  private shiftFor(n: number, t: Turn | null) {
    if (!this.o.cover) return 0
    const closed = -this.g.page / 2
    if (!t) return n === 0 ? closed : 0
    if (t.from === 0) return closed * (1 - easeInOut(clamp(t.t, 0, 1)))
    if (t.to === 0) return closed * easeInOut(clamp(t.t, 0, 1))
    return 0
  }

  private setShift(px: number) {
    this.p.root.style.setProperty('--skb-shift', `${px.toFixed(2)}px`)
  }

  private pose() {
    const t = this.turn
    if (!t) return
    const reach = t.leaf.pose(t.t, this.bow)
    this.setShift(this.shiftFor(t.from, t))
    // the lifted leaf's shadow on the page it is uncovering or landing on
    const a = 0.34 * Math.sin(Math.PI * clamp(t.t, 0, 1))
    const P = this.g.page
    for (const side of ['left', 'right'] as const) {
      const cast = this.p.book.querySelector<HTMLElement>(`.skb-base.${side} .skb-cast`)
      if (!cast) continue
      const over = side === 'right' ? reach > 0 : reach < 0
      cast.style.setProperty('--ca', over ? a.toFixed(3) : '0')
      cast.style.setProperty('--cx', `${Math.abs(reach).toFixed(1)}px`)
      cast.style.setProperty('--cw', `${(P * (0.12 + 0.2 * (1 - Math.abs(reach) / P))).toFixed(1)}px`)
    }
    this.fadeCaption(t.t)
  }

  /* ------------------------------------------------------ turn control */

  private canTurn(dir: Dir, from = this.pos) {
    return dir === 'next' ? from < this.model.max : from > this.model.min
  }

  private startTurn(dir: Dir, quiet: boolean) {
    this.settle()
    if (!this.canTurn(dir)) return false
    const from = this.pos
    const to = dir === 'next' ? from + 1 : from - 1
    this.turn = { dir, from, to, t: 0, leaf: this.makeLeaf(dir, from), motion: null, target: 1, quiet }
    this.render()
    return true
  }

  /** Jump any turn in flight to where it was heading. */
  private settle() {
    const t = this.turn
    if (!t) return
    this.turn = null
    this.pos = t.target === 1 ? t.to : t.from
    this.render()
  }

  private animate(target: 0 | 1, motion: Motion) {
    if (!this.turn) return
    this.turn.target = target
    this.turn.motion = motion
    this.kick()
  }

  private finish() {
    const t = this.turn
    if (!t) return
    this.turn = null
    const moved = t.target === 1
    this.pos = moved ? t.to : t.from
    this.render()
    if (moved) this.announce(t.quiet)
    const next = this.queue
    if (next) {
      if (next.target === this.pos) { this.queue = null; this.endRiffle() }
      else this.stepToward(next.target, next.quiet)
    } else this.endRiffle()
  }

  private announce(quiet: boolean) {
    const n = this.pos
    this.p.live.textContent = n === 0 ? 'Cover' : `Opening ${n} of ${this.model.count}. ${this.model.page(n)?.alt ?? ''}`
    this.cb.onChange?.(n)
    if (quiet) return
    this.cb.onEvent?.({ type: 'turn', opening: n, total: this.model.count })
    this.writeHash()
  }

  /** One page, animated. */
  step(dir: Dir) {
    this.queue = null
    this.turnOnce(dir, false)
  }

  private turnOnce(dir: Dir, quiet: boolean, seconds?: number) {
    if (this.reduced) {
      this.settle()
      if (!this.canTurn(dir)) return
      this.pos += dir === 'next' ? 1 : -1
      this.render()
      this.flash()
      this.announce(quiet)
      return
    }
    if (!this.startTurn(dir, quiet)) return
    const board = this.turn!.leaf.spec.board
    if (seconds) this.animate(1, tween(0, 1, seconds, linear))
    else if (board) this.animate(1, tween(0, 1, 1.05, easeInOut))
    else this.animate(1, tween(0, 1, 0.78, easeOutish))
  }

  /** Go to any opening, riffling through the pages between. */
  goTo(target: number, intro = false) {
    target = this.model.clamp(target)
    if (this.reduced) {
      this.settle()
      if (target === this.pos) return
      this.pos = target
      this.render()
      this.flash()
      this.announce(intro)
      return
    }
    if (!this.turn && target === this.pos) return
    // the last page of a jump is a real turn and reports itself
    this.lastQuiet = intro
    const from = this.turn ? this.turn.to : this.pos
    this.queue = { target, quiet: true }
    if (Math.abs(target - from) > 1) this.beginRiffle()
    // a turn in flight finishes first, then picks up the queue
    if (!this.turn) this.stepToward(target, true)
  }

  private lastQuiet = false
  private riffleTotal = 0
  private riffleDone = 0

  private beginRiffle() {
    this.riffling = true
    this.riffleDone = 0
    this.riffleTotal = Math.abs((this.queue?.target ?? this.pos) - this.pos)
    this.p.root.classList.add('skb-riffling')
  }

  private endRiffle() {
    this.riffling = false
    this.p.root.classList.remove('skb-riffling', 'skb-blur-2')
  }

  private stepToward(target: number, quiet: boolean) {
    const dir: Dir = target > this.pos ? 'next' : 'prev'
    const last = Math.abs(target - this.pos) === 1
    if (last) this.queue = null
    const quietNow = last ? this.lastQuiet : quiet
    const coverTurn = (dir === 'next' && this.pos === 0) || (dir === 'prev' && this.pos === 1 && this.model.hasCover)
    if (!this.riffling || coverTurn) {
      this.turnOnce(dir, quietNow)
      return
    }
    // a riffle runs on a bell: slow, quick, quick, slow
    const k = this.riffleTotal > 1 ? this.riffleDone / (this.riffleTotal - 1) : 0
    const bell = Math.sin(Math.PI * clamp(k, 0, 1))
    this.riffleDone++
    this.p.root.classList.toggle('skb-blur-2', bell > 0.6)
    this.turnOnce(dir, quietNow, last ? 0.5 : 0.36 - 0.24 * bell)
  }

  private flash() {
    this.p.book.classList.remove('skb-flash')
    void this.p.book.offsetWidth
    this.p.book.classList.add('skb-flash')
  }

  /* ------------------------------------------------------------- frames */

  private kick() {
    if (this.raf === null && !this.destroyed) {
      this.lastFrame = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  private tick = (now: number) => {
    this.raf = null
    const dt = Math.min(0.034, (now - this.lastFrame) / 1000 || 0.016)
    this.lastFrame = now
    let busy = false
    const t = this.turn
    if (t?.motion && !this.drag) {
      const r = t.motion.step(t.t, dt)
      t.t = r.value
      // a page flung hard bows more; one that is laid down bows less
      const v = Math.abs(t.motion.velocity)
      this.bow = 0.58 + clamp(v * 0.05, 0, 0.26)
      this.pose()
      if (r.done) this.finish()
      busy = true
    }
    busy = this.easeView() || busy
    if (busy || this.turn?.motion) this.kick()
  }

  /* -------------------------------------------------------------- view */

  private onHover = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || this.reduced) return
    const r = this.p.box.getBoundingClientRect()
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1)
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1)
    this.setView(-ny * 4, nx * 6.5, this.view.tz)
  }

  private onLeave = () => this.setView(0, 0, this.view.tz)
  private onOut = (e: PointerEvent) => { if (!e.relatedTarget) this.onLeave() }

  setView(rx: number, ry: number, z: number) {
    this.view.trx = rx
    this.view.try = ry
    this.view.tz = clamp(z, 0.9, 1.6)
    this.p.zoomRead.textContent = `${Math.round(this.view.tz * 100)}%`
    this.p.root.dataset.zoomMin = this.view.tz <= 0.901 ? 'yes' : 'no'
    this.p.root.dataset.zoomMax = this.view.tz >= 1.599 ? 'yes' : 'no'
    this.kick()
  }

  zoomBy(f: number) { this.setView(this.view.trx, this.view.try, this.view.tz * f) }

  private easeView(): boolean {
    const v = this.view
    let moving = false
    for (const [k, tk] of [['rx', 'trx'], ['ry', 'try'], ['z', 'tz']] as const) {
      const d = v[tk] - v[k]
      if (Math.abs(d) > (k === 'z' ? 0.0005 : 0.01)) { v[k] += d * 0.12; moving = true }
      else v[k] = v[tk]
    }
    const s = this.p.root.style
    s.setProperty('--skb-rx', `${v.rx.toFixed(2)}deg`)
    s.setProperty('--skb-ry', `${v.ry.toFixed(2)}deg`)
    s.setProperty('--skb-zoom', v.z.toFixed(4))
    if (moving) this.loupe.place()
    return moving
  }

  toggleLoupe() {
    this.loupe.setEnabled(!this.loupe.enabled)
    return this.loupe.enabled
  }

  /* ------------------------------------------------------------- input */

  private bookScreen() {
    const r = this.p.box.getBoundingClientRect()
    const z = this.view.z
    const cx = r.left + r.width / 2 + this.shiftFor(this.pos, this.turn) * z
    return { cx, page: this.g.page * z, top: r.top + r.height / 2 - (this.g.height * z) / 2, height: this.g.height * z }
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    const tgt = e.target as HTMLElement
    if (tgt.closest('button, a, .skb-loupe')) return
    const s = this.bookScreen()
    const x = e.clientX - s.cx
    if (Math.abs(x) > s.page * 1.08 || e.clientY < s.top - 12 || e.clientY > s.top + s.height + 12) return
    if (this.pos === 0 && !this.turn && x < 0) return
    if (e.pointerType === 'mouse') e.preventDefault()
    this.p.stage.setPointerCapture(e.pointerId)
    this.drag = {
      id: e.pointerId, x0: e.clientX, y0: e.clientY, at: performance.now(), moved: false,
      side: x >= 0 ? 'right' : 'left', t0: 0, vel: 0, last: performance.now(), lastT: 0, blocked: false,
    }
  }

  private onMove = (e: PointerEvent) => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0
    if (!d.moved) {
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy)) return
      d.moved = true
      this.queue = null
      this.endRiffle()
      const dir: Dir = d.side === 'right' ? 'next' : 'prev'
      // grabbing a page that is still moving: carry on from where it is
      if (this.turn && this.turn.dir === dir) {
        this.turn.motion = null
        d.t0 = this.turn.t
      } else if (this.reduced || !this.startTurn(dir, false)) {
        d.blocked = true
        return
      }
      d.x0 = e.clientX
    }
    if (d.blocked || !this.turn) return
    const s = this.bookScreen()
    const raw = (this.turn.dir === 'next' ? -1 : 1) * (e.clientX - d.x0)
    const t = clamp(d.t0 + raw / (s.page * 1.25), 0, 1)
    const now = performance.now()
    const inst = (t - d.lastT) / Math.max(0.008, (now - d.last) / 1000)
    d.vel = d.vel * 0.6 + inst * 0.4
    d.last = now
    d.lastT = t
    this.turn.t = t
    this.bow = 0.58 + clamp(Math.abs(d.vel) * 0.05, 0, 0.26)
    this.pose()
  }

  private onUp = (e: PointerEvent) => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    this.drag = null
    if (!d.moved) {
      if (performance.now() - d.at < 600) this.tap(d.side)
      return
    }
    if (d.blocked || !this.turn) return
    const t = this.turn
    const commit = d.vel > 1.1 || (d.vel > -1.1 && t.t > 0.42)
    const target = commit ? 1 : 0
    this.animate(target, spring(target, 150, 23, d.vel))
  }

  private onCancel = (e: PointerEvent) => {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    this.drag = null
    if (d.moved && this.turn) this.animate(this.turn.t > 0.5 ? 1 : 0, spring(this.turn.t > 0.5 ? 1 : 0))
  }

  private tap(side: 'left' | 'right') {
    if (this.turn) return
    if (this.pos === 0) { this.goTo(1); return }
    this.openPage(this.pos, side)
  }

  openPage(opening: number, side: 'left' | 'right') {
    const p = this.model.page(opening)
    if (!p) return
    this.cb.onEvent?.({ type: 'open', opening, side: p.spread ? 'spread' : side })
    this.cb.onPageClick?.(opening, side)
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement | null
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
    if (document.querySelector('.skb-lightbox')) return
    const inside = t ? this.p.root.contains(t) : false
    if (!inside && !this.visible) return
    if (e.key === 'ArrowRight') { e.preventDefault(); this.step('next') }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this.step('prev') }
    else if (inside && (e.key === 'Enter' || e.key === ' ') && t === this.p.stage) {
      e.preventDefault()
      if (this.pos === 0) this.goTo(1)
      else this.openPage(this.pos, 'right')
    } else if (inside && (e.key === '+' || e.key === '=')) this.zoomBy(1.15)
    else if (inside && e.key === '-') this.zoomBy(1 / 1.15)
    else if (inside && e.key === '0') this.setView(this.view.trx, this.view.try, 1)
  }

  /* --------------------------------------------------------- captions */

  private caption(n: number) {
    if (n === 0) return this.o.cover ? this.o.cover.subtitle ?? this.o.cover.title : ''
    return this.model.page(n)?.caption ?? ''
  }

  private renderCaption() {
    const box = this.p.captions
    if (!this.o.captions) { box.textContent = ''; return }
    box.textContent = ''
    this.caps = { out: null, in: null }
    const t = this.turn
    if (t) {
      const a = el('p', 'skb-caption', this.caption(t.from))
      const b = el('p', 'skb-caption', this.caption(t.to))
      box.append(a, b)
      this.caps = { out: a, in: b }
      this.fadeCaption(t.t)
    } else {
      box.appendChild(el('p', 'skb-caption', this.caption(this.pos)))
    }
  }

  private fadeCaption(t: number) {
    const { out, in: inn } = this.caps
    if (!out || !inn) return
    out.style.opacity = (1 - clamp((t - 0.08) / 0.3, 0, 1)).toFixed(3)
    inn.style.opacity = clamp((t - 0.55) / 0.3, 0, 1).toFixed(3)
  }

  private renderCounter() {
    const n = this.turn ? this.turn.to : this.pos
    const total = this.model.count
    this.p.counter.textContent = n === 0 ? 'Cover' : `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
    this.p.root.dataset.atStart = n <= this.model.min ? 'yes' : 'no'
    this.p.root.dataset.atEnd = n >= this.model.max ? 'yes' : 'no'
  }

  /* -------------------------------------------------------------- hash */

  private hashOpening(): number | null {
    const m = /^#page-(\d+)$/.exec(location.hash)
    if (!m) return null
    return this.model.clamp(parseInt(m[1], 10))
  }

  private writeHash() {
    const url = this.pos > 0 ? `#page-${this.pos}` : location.pathname + location.search
    history.replaceState(history.state, '', url)
  }

  private onHash = () => {
    const n = this.hashOpening()
    if (n !== null && n !== this.pos) this.goTo(n)
  }

  /* ------------------------------------------------------------ public */

  current() { return this.turn ? this.turn.to : this.pos }
  goToProject(slug: string) {
    const n = this.model.openingOf(slug)
    if (n !== null) this.goTo(n)
  }
}

function div(cls: string) {
  const d = document.createElement('div')
  d.className = cls
  return d
}
function el(tag: string, cls: string, text: string) {
  const e = document.createElement(tag)
  e.className = cls
  e.textContent = text
  return e
}
function prevent(e: Event) { e.preventDefault() }
