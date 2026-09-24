import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import { SketchbookEngine } from './engine/engine'
import { Lightbox } from './Lightbox'
import type { SketchbookHandle, SketchbookProps } from './types'
import './sketchbook.css'

/**
 * Kagadmodyaa Sketchbook.
 *
 *   <Sketchbook pages={pages} book={{ binding: 'spiral', cover: { title: 'Portfolio' } }} />
 *
 * React draws the frame once; the engine owns the book inside it.
 */
export function Sketchbook({
  pages,
  book,
  projects = [],
  className = '',
  label = 'Sketchbook',
  onEvent,
  onPageClick,
  projectHref,
  ref,
}: SketchbookProps & { ref?: Ref<SketchbookHandle> }) {
  const root = useRef<HTMLElement>(null)
  const engine = useRef<SketchbookEngine | null>(null)
  const [open, setOpen] = useState<{ opening: number; side: 'left' | 'right' } | null>(null)
  const [loupeOn, setLoupeOn] = useState(book?.loupe ?? true)
  const id = useId().replace(/:/g, '')

  // callbacks change identity every render; the engine reads the latest
  const latest = useRef({ onEvent, onPageClick })
  latest.current = { onEvent, onPageClick }

  // rebuild the engine only when the content really changes
  const key = useMemo(() => JSON.stringify([pages, book, projects]), [pages, book, projects])
  // when new options rebuild the book, reopen it where the reader was
  const lastKey = useRef<string | null>(null)
  const lastOpening = useRef<number | null>(null)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!root.current) return
    const changed = lastKey.current !== null && lastKey.current !== key
    const resumeAt = changed && lastOpening.current !== null ? lastOpening.current : undefined
    lastKey.current = key
    const e = new SketchbookEngine(root.current, pages, book, projects, {
      onEvent: ev => latest.current.onEvent?.(ev),
      onPageClick: (opening, side) => {
        if (latest.current.onPageClick?.(opening, side) === true) return
        setOpen({ opening, side })
      },
    }, { resumeAt })
    engine.current = e
    return () => { lastOpening.current = e.current(); e.destroy(); engine.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, run])

  useImperativeHandle(ref, () => ({
    goTo: n => engine.current?.goTo(n),
    goToProject: slug => engine.current?.goToProject(slug),
    next: () => engine.current?.step('next'),
    prev: () => engine.current?.step('prev'),
    current: () => engine.current?.current() ?? 0,
    replayIntro: () => {
      // a #page-n in the address would open the book straight there
      if (/^#page-\d+$/.test(location.hash)) history.replaceState(history.state, '', location.pathname + location.search)
      lastKey.current = null
      setRun(r => r + 1)
    },
  }), [])

  const blur = { '--skb-blur-1': `url(#${id}-b1)`, '--skb-blur-2': `url(#${id}-b2)` } as React.CSSProperties

  return (
    <section ref={root} className={`skb ${className}`} style={blur} aria-roledescription="sketchbook" aria-label={label}>
      <div className="skb-probe" data-skb="probe" aria-hidden="true" />
      <svg width="0" height="0" className="skb-defs" aria-hidden="true">
        <filter id={`${id}-b1`}><feGaussianBlur stdDeviation="4 0" /></filter>
        <filter id={`${id}-b2`}><feGaussianBlur stdDeviation="11 0" /></filter>
      </svg>

      <div className="skb-stage" data-skb="stage" tabIndex={0}
        aria-label="Book. Drag a page, or use the arrow keys, to turn. Press Enter to look closer.">
        <button type="button" className="skb-arrow skb-prev" aria-label="Previous page" onClick={() => engine.current?.step('prev')}>
          <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"><polyline points="11,3 3,22 11,41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="skb-box" data-skb="box">
          <div className="skb-tilt" data-skb="tilt">
            <div className="skb-book" data-skb="book" />
          </div>
          <div className="skb-zoom" data-skb="zoom" aria-hidden="true"><div className="skb-zoom-inner" data-skb="zoom-inner" /></div>
          <div className="skb-loupe" data-skb="loupe" aria-hidden="true">
            <span className="skb-loupe-handle" />
            <span className="skb-loupe-ring" />
            <span className="skb-loupe-glass" />
          </div>
        </div>
        <button type="button" className="skb-arrow skb-next" aria-label="Next page" onClick={() => engine.current?.step('next')}>
          <svg viewBox="0 0 14 44" width="14" height="44" fill="none" aria-hidden="true"><polyline points="3,3 11,22 3,41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      <div className="skb-captions" data-skb="captions" aria-hidden="true" />

      <div className="skb-toolbar" role="group" aria-label="Sketchbook controls">
        <button type="button" className="skb-tool skb-prev" aria-label="Previous page" onClick={() => engine.current?.step('prev')}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4 6 10l6 6" /></svg>
        </button>
        <span className="skb-counter" data-skb="counter" />
        <button type="button" className="skb-tool skb-next" aria-label="Next page" onClick={() => engine.current?.step('next')}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m8 4 6 6-6 6" /></svg>
        </button>
        <span className="skb-sep" aria-hidden="true" />
        <button type="button" className="skb-tool skb-zoom-out" aria-label="Zoom out" onClick={() => engine.current?.zoomBy(1 / 1.15)}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="8.6" cy="8.6" r="5.6" /><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8" /></svg>
        </button>
        <span className="skb-zoom-read" data-skb="zoom-read">100%</span>
        <button type="button" className="skb-tool skb-zoom-in" aria-label="Zoom in" onClick={() => engine.current?.zoomBy(1.15)}>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="8.6" cy="8.6" r="5.6" /><path d="M12.8 12.8 17.4 17.4M6.2 8.6h4.8M8.6 6.2v4.8" /></svg>
        </button>
        {(book?.loupe ?? true) && <>
          <span className="skb-sep skb-loupe-only" aria-hidden="true" />
          <button type="button" className="skb-tool skb-loupe-only" aria-label="Magnifying glass" aria-pressed={loupeOn}
            onClick={() => setLoupeOn(engine.current?.toggleLoupe() ?? false)}>
            <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="M13 13l4.4 4.4" /><path d="M6.4 7.2a3.2 3.2 0 0 1 2.4-1.4" opacity=".55" /></svg>
          </button>
        </>}
      </div>

      <p className="skb-sr" aria-live="polite" data-skb="live" />
      <ol className="skb-sr" aria-label="Pages">
        {pages.map((p, i) => (
          <li key={i}><button type="button" onClick={() => engine.current?.goTo(i + 1)}>{p.caption ? `${p.caption}: ` : ''}{p.alt}</button></li>
        ))}
      </ol>

      {open && (
        <Lightbox
          pages={pages}
          opening={open.opening}
          side={open.side}
          projects={projects}
          projectHref={projectHref}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}
