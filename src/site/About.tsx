import config from '../portfolio.config'

export default function About() {
  const { student } = config
  return (
    <section id="about" className="mx-auto grid max-w-6xl scroll-mt-20 gap-8 px-5 py-24 sm:grid-cols-[1fr_2fr] sm:px-8">
      <p className="text-xs tracking-[0.24em] text-ink/50 uppercase">About</p>
      <div className="space-y-5">
        {student.about.map((para, i) => (
          <p key={i} className={i === 0 ? 'font-display text-3xl leading-snug sm:text-4xl' : 'max-w-2xl text-[15px] leading-relaxed text-ink/70'}>
            {para}
          </p>
        ))}
      </div>
    </section>
  )
}
