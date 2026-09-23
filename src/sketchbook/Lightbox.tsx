import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SketchbookPage, SketchbookProject } from './types'

/* The larger view. Every image in the book, one at a time: a spread image
   is shown whole, a two-image opening is shown page by page. */

type View = { src: string; alt: string; caption?: string; project?: string; opening: number; side: 'left' | 'right' | 'spread' }

function views(pages: SketchbookPage[]): View[] {
  const out: View[] = []
  pages.forEach((p, i) => {
    const base = { alt: p.alt, caption: p.caption, project: p.project, opening: i + 1 }
    if (p.spread) out.push({ ...base, src: p.spread, side: 'spread' })
    else {
      if (p.left) out.push({ ...base, src: p.left, side: 'left' })
      if (p.right) out.push({ ...base, src: p.right, side: 'right' })
    }
  })
  return out
}

export function Lightbox({
  pages, opening, side, projects, projectHref, onClose,
}: {
  pages: SketchbookPage[]
  opening: number
  side: 'left' | 'right'
  projects: SketchbookProject[]
  projectHref?: (slug: string) => string
  onClose: () => void
}) {
  const all = useMemo(() => views(pages), [pages])
  const start = useMemo(() => {
    const exact = all.findIndex(v => v.opening === opening && (v.side === side || v.side === 'spread'))
    return exact >= 0 ? exact : Math.max(0, all.findIndex(v => v.opening === opening))
  }, [all, opening, side])
  const [i, setI] = useState(start)
  const [zoomed, setZoomed] = useState(false)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const v = all[i]

  const go = useCallback((d: number) => {
    setZoomed(false)
    setI(k => Math.max(0, Math.min(all.length - 1, k + d)))
  }, [all.length])

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      document.body.style.overflow = overflow
      before?.focus?.({ preventScroll: true })
    }
  }, [go, onClose])

  // when zooming in, start centred on the spot that was clicked
  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const r = img.getBoundingClientRect()
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height
    setZoomed(z => !z)
    requestAnimationFrame(() => {
      const s = scroller.current
      if (!s || zoomed) return
      s.scrollLeft = fx * s.scrollWidth - s.clientWidth / 2
      s.scrollTop = fy * s.scrollHeight - s.clientHeight / 2
    })
  }

  if (!v) return null
  const project = v.project ? projects.find(p => p.slug === v.project) : undefined
  const href = v.project && projectHref ? projectHref(v.project) : undefined

  return createPortal(
    <div className="skb-lightbox" role="dialog" aria-modal="true" aria-label={v.caption ?? v.alt}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={scroller} className={`skb-lb-stage${zoomed ? ' zoomed' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <img key={v.src} src={v.src} alt={v.alt} className="skb-lb-img" draggable={false} onClick={toggleZoom} />
      </div>
      <div className="skb-lb-bar">
        <div className="skb-lb-text">
          {v.caption && <p className="skb-lb-caption">{v.caption}</p>}
          {href && <a className="skb-lb-project" href={href}>View project{project ? `: ${project.title}` : ''} →</a>}
        </div>
        <div className="skb-lb-nav">
          <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous image">←</button>
          <span>{i + 1} / {all.length}</span>
          <button type="button" onClick={() => go(1)} disabled={i === all.length - 1} aria-label="Next image">→</button>
        </div>
      </div>
      <button ref={closeBtn} type="button" className="skb-lb-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" /></svg>
      </button>
    </div>,
    document.body,
  )
}
