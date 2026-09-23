import { Link } from 'react-router'
import config from '../portfolio.config'

export default function Header() {
  const { student } = config
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-bg via-bg/80 to-transparent" />
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-5 pt-5 pb-10 sm:px-8">
        <Link to="/" className="font-display text-2xl leading-none whitespace-nowrap">{student.name}</Link>
        <nav className="flex gap-5 text-sm text-ink/60 sm:gap-7">
          <a href="/#work" className="transition-colors hover:text-ink">Work</a>
          <a href="/#about" className="transition-colors hover:text-ink">About</a>
          <a href="/#contact" className="transition-colors hover:text-ink">Contact</a>
        </nav>
      </div>
    </header>
  )
}
