import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-5 text-center">
      <div>
        <p className="font-display text-7xl">404</p>
        <p className="mt-3 text-ink/60">This page isn’t in the book.</p>
        <Link to="/" className="mt-6 inline-block text-accent underline-offset-4 hover:underline">Back to the portfolio</Link>
      </div>
    </main>
  )
}
