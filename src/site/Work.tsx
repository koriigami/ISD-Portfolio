import { Link } from 'react-router'
import config from '../portfolio.config'

export default function Work({ onOpenInBook }: { onOpenInBook: (slug: string) => void }) {
  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8">
      <p className="text-xs tracking-[0.24em] text-ink/50 uppercase">Selected work</p>
      <ol className="mt-10 border-t border-ink/15">
        {config.projects.map((p, i) => (
          <li key={p.slug} className="grid gap-x-8 gap-y-3 border-b border-ink/15 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline">
            <span className="font-display text-3xl text-ink/35">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h2 className="font-display text-4xl leading-tight">{p.title}</h2>
              <p className="mt-1 text-xs tracking-[0.14em] text-ink/50 uppercase">
                {[p.type, p.location, p.year].filter(Boolean).join(' · ')}
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/70">{p.summary}</p>
            </div>
            <div className="flex gap-5 text-sm sm:flex-col sm:items-end sm:gap-2">
              <button type="button" onClick={() => onOpenInBook(p.slug)} className="cursor-pointer text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline">
                Open in the book
              </button>
              <Link to={`/projects/${p.slug}`} className="text-accent underline-offset-4 hover:underline">
                Project page →
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
