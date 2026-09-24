import type { RefObject } from 'react'
import config from '../portfolio.config'
import { track } from '../lib/analytics'
import { useBookDesign } from '../showcase/useBookDesign'
import { Sketchbook, type SketchbookHandle } from '../sketchbook'

export default function Hero({ bookRef }: { bookRef: RefObject<SketchbookHandle | null> }) {
  const { student, pages, projects } = config
  // `book` is config.book; while you run `npm run dev` a "Design your book"
  // panel lets you try other settings (it never appears on the live site)
  const { book, panel } = useBookDesign(config.book, bookRef)
  return (
    <section id="book" className="relative flex min-h-svh flex-col items-center justify-center overflow-x-clip pt-24 pb-14"
      style={{ paddingRight: 'var(--design-panel-w, 0px)' }}>
      {/* a little light on the desk */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(255,255,255,0.55),transparent_70%)]" />
      <p className="mb-4 px-5 text-center text-xs tracking-[0.24em] text-ink/55 uppercase">{student.tagline}</p>
      <Sketchbook
        ref={bookRef}
        pages={pages}
        book={book}
        projects={projects.map(p => ({ slug: p.slug, title: p.title, color: p.color }))}
        label={`${student.name}'s portfolio sketchbook`}
        projectHref={slug => `/projects/${slug}`}
        onEvent={e => {
          if (e.type === 'turn') track('sketchbook_turn', { page: e.opening })
          if (e.type === 'open') track('sketchbook_open', { page: e.opening })
        }}
      />
      <p className="mt-2 px-5 text-center text-xs text-ink/40">Drag a page to turn it · Click a page to look closer</p>
      {panel}
    </section>
  )
}
