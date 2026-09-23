import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import config from '../portfolio.config'
import { track } from '../lib/analytics'
import Footer from '../site/Footer'
import Header from '../site/Header'
import NotFound from './NotFound'

/* One page per project: /projects/<slug>. Shows the project's text, every
   book page tagged with it, and any extra images from the config. */
export default function ProjectPage() {
  const { slug } = useParams()
  const index = config.projects.findIndex(p => p.slug === slug)
  const project = config.projects[index]

  useEffect(() => {
    if (!project) return
    document.title = `${project.title} — ${config.student.name}`
    track('project_view', { slug: project.slug })
  }, [project])

  if (!project) return <NotFound />

  const bookImages = config.pages
    .map((p, i) => ({ p, opening: i + 1 }))
    .filter(({ p }) => p.project === project.slug)
    .flatMap(({ p, opening }) => {
      if (p.spread) return [{ src: p.spread, alt: p.alt, caption: p.caption, opening, wide: true }]
      return [p.left, p.right].filter((s): s is string => !!s).map(src => ({ src, alt: p.alt, caption: p.caption, opening, wide: false }))
    })
  const images = [...bookImages, ...(project.images ?? []).map(im => ({ ...im, opening: 0, wide: true }))]
  const next = config.projects[(index + 1) % config.projects.length]

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8">
        <Link to="/#work" className="text-sm text-ink/50 hover:text-ink">← All work</Link>
        <h1 className="mt-8 font-display text-6xl leading-none sm:text-8xl">{project.title}</h1>
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
          {([['Type', project.type], ['Location', project.location], ['Area', project.area], ['Year', project.year]] as const)
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] tracking-[0.18em] text-ink/45 uppercase">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
        </dl>
        <div className="mt-12 grid gap-6 sm:grid-cols-[1fr_2fr]">
          <p className="font-display text-2xl leading-snug">{project.summary}</p>
          <div className="space-y-4 text-[15px] leading-relaxed text-ink/70">
            {project.story?.map((s, i) => <p key={i}>{s}</p>)}
          </div>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2">
          {images.map((im, i) => (
            <figure key={i} className={im.wide ? 'sm:col-span-2' : ''}>
              <img src={im.src} alt={im.alt} loading="lazy" className="w-full bg-white/40 shadow-[0_20px_50px_-28px_rgba(40,28,14,0.5)]" />
              {im.caption && <figcaption className="mt-3 text-sm text-ink/55">{im.caption}</figcaption>}
            </figure>
          ))}
        </div>

        {next && next.slug !== project.slug && (
          <Link to={`/projects/${next.slug}`} className="group mt-24 block border-t border-ink/15 pt-8">
            <span className="text-xs tracking-[0.24em] text-ink/45 uppercase">Next project</span>
            <span className="mt-2 block font-display text-5xl group-hover:text-accent">{next.title} →</span>
          </Link>
        )}
      </main>
      <Footer />
    </>
  )
}
