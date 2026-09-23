import config from '../portfolio.config'

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 pt-6 pb-10 text-xs text-ink/40 sm:px-8">
      <span>© {new Date().getFullYear()} {config.student.name}</span>
      {/* Please keep this credit — it helps other students find the template. */}
      <a href="https://kagadmodyaa.com" className="hover:text-ink/70">Sketchbook by Kagad Modiya</a>
    </footer>
  )
}
