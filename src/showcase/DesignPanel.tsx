import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import type { Binding, BookOptions, CoverOptions, PageShape, PaperTexture, SketchbookHandle } from '../sketchbook'
import { bookPrompt, bookSnippet, copy } from './snippet'

/* "Design your book": every option of the sketchbook, live. Students try
   combinations here, then copy the settings into portfolio.config.ts. */

const SHAPES: [PageShape, string][] = [['square', 'Square'], ['portrait', 'Portrait'], ['landscape', 'Landscape']]
const BINDINGS: [Binding, string][] = [['stitched', 'Stitched'], ['spiral', 'Spiral'], ['wire-o', 'Wire-O'], ['coptic', 'Coptic'], ['glued', 'Glued']]
const TEXTURES: [PaperTexture, string][] = [
  ['hot-press', 'Hot-press'], ['cold-press', 'Cold-press'], ['smooth', 'Smooth'], ['kraft', 'Kraft'],
  ['dotted', 'Dotted'], ['grid', 'Grid'], ['none', 'Flat'],
]
const PAPERS: [string, string][] = [
  ['#fbfaf7', 'White'], ['#f6f5f1', 'Soft white'], ['#f4eee2', 'Ivory'], ['#ece2cc', 'Cream'],
  ['#e2e1dc', 'Grey'], ['#cdb088', 'Kraft'], ['#1f1e1c', 'Black'],
]
const WIRES: [string, string][] = [['#a9a59c', 'Silver'], ['#2b2a28', 'Black'], ['#b8995a', 'Gold'], ['#a8674a', 'Copper'], ['#f2efe8', 'White']]
const THREADS: [string, string][] = [['#8a7b66', 'Linen'], ['#3b342c', 'Brown'], ['#2f5f70', 'Teal'], ['#8e2f25', 'Red'], ['#f2efe8', 'White']]
const COVERS: [string, string][] = [
  ['#ecebe7', 'Light card'], ['#d8cdb8', 'Sand'], ['#7d8b76', 'Sage'], ['#33413a', 'Forest'],
  ['#243447', 'Navy'], ['#a4553a', 'Terracotta'], ['#5a3a26', 'Tan'], ['#1f1f1f', 'Black'],
]
const MATERIALS: [NonNullable<CoverOptions['material']>, string][] = [['card', 'Card'], ['cloth', 'Cloth'], ['kraft', 'Kraft'], ['leather', 'Leather']]
const RIBBONS: [string, string][] = [['#9b3a2a', 'Red'], ['#2f5f70', 'Teal'], ['#c9a24b', 'Mustard'], ['#1f1f1f', 'Black']]

const isWire = (b?: Binding) => b === 'spiral' || b === 'wire-o'
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

export default function DesignPanel({ book, initial, onChange, bookRef }: {
  book: BookOptions
  initial: BookOptions
  onChange: (b: BookOptions) => void
  bookRef: RefObject<SketchbookHandle | null>
}) {
  const wide = useWide()
  const [open, setOpen] = useState(wide)
  const [copied, setCopied] = useState<'' | 'settings' | 'prompt'>('')
  const [showCode, setShowCode] = useState(false)
  const lastCover = useRef<CoverOptions>(initial.cover || { title: 'portfolio', color: '#ecebe7', material: 'card' })
  if (book.cover) lastCover.current = book.cover

  useEffect(() => { setOpen(wide) }, [wide])

  // on wide screens the panel sits beside the book, so the book makes room
  useEffect(() => {
    const docked = open && wide
    document.documentElement.style.setProperty('--design-panel-w', docked ? '360px' : '0px')
    return () => { document.documentElement.style.removeProperty('--design-panel-w') }
  }, [open, wide])

  const set = (patch: Partial<BookOptions>) => onChange({ ...book, ...patch })
  const setCover = (patch: Partial<CoverOptions>) => book.cover && set({ cover: { ...book.cover, ...patch } })
  const binding = book.binding ?? 'stitched'
  const colours = isWire(binding) ? WIRES : THREADS

  const doCopy = async (what: 'settings' | 'prompt') => {
    if (await copy(what === 'settings' ? bookSnippet(book) : bookPrompt(book))) {
      setCopied(what)
      setTimeout(() => setCopied(''), 1800)
    }
  }

  // on phones the sheet covers the lower half: lift the book above it
  const openSheet = () => {
    setOpen(true)
    if (!wide) {
      const el = document.querySelector('.skb')
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' })
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={openSheet}
        className="fixed right-4 bottom-4 z-40 cursor-pointer rounded-full bg-ink px-5 py-3 text-sm text-bg shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-0.5 lg:absolute lg:top-24 lg:bottom-auto">
        Design your book
      </button>
    )
  }

  return (
    <aside aria-label="Design your book"
      className="fixed inset-x-0 bottom-0 z-40 max-h-[46svh] overflow-y-auto rounded-t-2xl border-t border-ink/10 bg-[color-mix(in_oklab,var(--bg)_92%,white)] px-5 pt-4 pb-8 text-ink shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.35)] lg:absolute lg:inset-x-auto lg:top-0 lg:right-0 lg:bottom-0 lg:max-h-none lg:w-[360px] lg:rounded-none lg:border-t-0 lg:border-l lg:pt-24 lg:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl leading-tight">Design your book</h2>
          <p className="mt-1 text-[13px] leading-snug text-ink/55">Try every option, then copy the settings into <code className="text-ink/75">src/portfolio.config.ts</code>.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Hide the design panel"
          className="-mr-2 grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 5l10 10M15 5 5 15" /></svg>
        </button>
      </div>

      <Group label="Page shape" hint={book.pageShape === 'square' || !book.pageShape ? 'Opens to 2:1 — export spreads at 2400×1200' : undefined}>
        <Segments value={book.pageShape ?? 'square'} options={SHAPES} onChange={v => set({ pageShape: v })} />
      </Group>

      <Group label="Binding">
        <Segments value={binding} options={BINDINGS} onChange={v => set({ binding: v, bindingColor: undefined })} />
        {binding !== 'glued' && (
          <Swatches label={isWire(binding) ? 'Wire' : 'Thread'} value={book.bindingColor ?? colours[0][0]} options={colours}
            onChange={v => set({ bindingColor: v === colours[0][0] ? undefined : v })} />
        )}
      </Group>

      <Group label="Paper" hint={lum(book.paper ?? '#f2ede3') < 0.35 ? 'Dark paper shows around and behind your images. Pages exported with a white background will stay white.' : undefined}>
        <Swatches value={book.paper ?? '#f2ede3'} options={PAPERS} onChange={v => set({ paper: v })} custom />
        <Segments value={book.paperTexture ?? 'cold-press'} options={TEXTURES} onChange={v => set({ paperTexture: v })} />
      </Group>

      <Group label="Cover" aside={<Toggle label="Cover" on={!!book.cover} onChange={on => set({ cover: on ? lastCover.current : false })} />}>
        {book.cover ? (
          <>
            <Swatches value={book.cover.color ?? '#2f3b35'} options={COVERS} custom
              onChange={v => setCover({ color: v, ink: lum(v) > 0.6 ? '#2f5f70' : '#eee4cf' })} />
            <Segments value={book.cover.material ?? 'cloth'} options={MATERIALS} onChange={v => setCover({ material: v })} />
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Segments value={book.cover.align ?? 'left'} options={[['left', 'Title left'], ['right', 'Title right']]} onChange={v => setCover({ align: v })} />
              <Toggle label="Elastic band" on={!!book.cover.band} onChange={on => setCover({ band: on ? '#1f2622' : false })} />
            </div>
          </>
        ) : <p className="text-[13px] text-ink/50">The book starts open, without a cover.</p>}
      </Group>

      <Group label="Details">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <Toggle label="Ribbon" on={!!book.ribbon} onChange={on => set({ ribbon: on ? RIBBONS[0][0] : false })} />
          <Toggle label="Index tabs" on={book.tabs ?? true} onChange={on => set({ tabs: on })} />
          <Toggle label="Magnifier" on={book.loupe ?? true} onChange={on => set({ loupe: on })} />
          <Toggle label="Captions" on={book.captions ?? true} onChange={on => set({ captions: on })} />
        </div>
        {book.ribbon && <Swatches label="Ribbon" value={book.ribbon} options={RIBBONS} onChange={v => set({ ribbon: v })} />}
        <div className="mt-3">
          <Segments value={book.imageFit ?? 'contain'} options={[['contain', 'Whole image'], ['cover', 'Fill the page']]} onChange={v => set({ imageFit: v })} />
        </div>
      </Group>

      <div className="mt-6 grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Action onClick={() => doCopy('settings')} primary>{copied === 'settings' ? 'Copied ✓' : 'Copy settings'}</Action>
          <Action onClick={() => doCopy('prompt')}>{copied === 'prompt' ? 'Copied ✓' : 'Copy as AI prompt'}</Action>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Action onClick={() => bookRef.current?.replayIntro()}>Replay opening</Action>
          <Action onClick={() => onChange(initial)}>Reset</Action>
        </div>
        <button type="button" onClick={() => setShowCode(s => !s)} className="mt-1 cursor-pointer text-left text-[12px] text-ink/50 underline-offset-4 hover:text-ink hover:underline">
          {showCode ? 'Hide settings' : 'Show settings'}
        </button>
        {showCode && (
          <pre className="overflow-x-auto rounded-lg bg-ink/[0.04] p-3 text-[11.5px] leading-relaxed text-ink/80"><code>{bookSnippet(book)}</code></pre>
        )}
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------- pieces */

function Group({ label, hint, aside, children }: { label: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6 border-t border-ink/10 pt-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-[11px] tracking-[0.2em] text-ink/55 uppercase">{label}</h3>
        {aside}
      </div>
      <div className="grid gap-3">{children}</div>
      {hint && <p className="mt-2 text-[12px] text-ink/45">{hint}</p>}
    </section>
  )
}

function Segments<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map(([v, label]) => (
        <button key={v} type="button" role="radio" aria-checked={v === value} onClick={() => onChange(v)}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] leading-none transition-colors ${v === value ? 'border-ink bg-ink text-bg' : 'border-ink/15 text-ink/75 hover:border-ink/40 hover:text-ink'}`}>
          {label}
        </button>
      ))}
    </div>
  )
}

function Swatches({ value, options, onChange, label, custom }: {
  value: string; options: [string, string][]; onChange: (v: string) => void; label?: string; custom?: boolean
}) {
  const timer = useRef<number | undefined>(undefined)
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label}>
      {label && <span className="mr-1 text-[12px] text-ink/55">{label}</span>}
      {options.map(([v, name]) => (
        <button key={v} type="button" role="radio" aria-checked={v.toLowerCase() === value.toLowerCase()} title={name} aria-label={name}
          onClick={() => onChange(v)}
          className={`h-7 w-7 cursor-pointer rounded-full border border-black/15 transition-shadow ${v.toLowerCase() === value.toLowerCase() ? 'ring-2 ring-ink ring-offset-2 ring-offset-bg' : 'hover:ring-1 hover:ring-ink/40 hover:ring-offset-2 hover:ring-offset-bg'}`}
          style={{ background: v }} />
      ))}
      {custom && (
        <label className="relative grid h-7 w-7 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-ink/35 text-ink/50" title="Any colour">
          <span aria-hidden className="text-sm leading-none">+</span>
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} aria-label="Pick any colour"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={e => { const v = e.target.value; clearTimeout(timer.current); timer.current = window.setTimeout(() => onChange(v), 120) }} />
        </label>
      )}
    </div>
  )
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink/75 hover:text-ink">
      <span className={`relative h-[18px] w-8 rounded-full transition-colors ${on ? 'bg-ink' : 'bg-ink/20'}`}>
        <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-bg shadow transition-[left] ${on ? 'left-[16px]' : 'left-[2px]'}`} />
      </span>
      {label}
    </button>
  )
}

function Action({ children, onClick, primary }: { children: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={`cursor-pointer rounded-full px-4 py-2.5 text-[13px] transition-colors ${primary ? 'bg-accent text-white hover:brightness-110' : 'border border-ink/15 text-ink/80 hover:border-ink/40 hover:text-ink'}`}>
      {children}
    </button>
  )
}

function useWide() {
  const q = '(min-width: 1024px)'
  const [wide, setWide] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const on = () => setWide(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}
