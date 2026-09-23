import config from '../portfolio.config'

export default function Contact() {
  const { student } = config
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 border-t border-ink/15 px-5 py-24 sm:px-8">
      <p className="text-xs tracking-[0.24em] text-ink/50 uppercase">Contact</p>
      {student.email && (
        <a href={`mailto:${student.email}`} className="mt-6 inline-block font-display text-4xl break-all underline-offset-8 hover:text-accent sm:text-6xl">
          {student.email}
        </a>
      )}
      <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink/60">
        {student.location && <span>{student.location}</span>}
        {student.links?.map(l => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-ink hover:underline">
            {l.label}
          </a>
        ))}
      </div>
    </section>
  )
}
