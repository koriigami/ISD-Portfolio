import { useRef } from 'react'
import type { SketchbookHandle } from '@kagadmodyaa/sketchbook'
import About from './About'
import Contact from './Contact'
import Footer from './Footer'
import Header from './Header'
import Hero from './Hero'
import Work from './Work'

/* The landing page, top to bottom. Each section is its own file in
   src/site/ — change, reorder or add sections freely. */
export default function Home() {
  const book = useRef<SketchbookHandle>(null)

  const openProject = (slug: string) => {
    document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    book.current?.goToProject(slug)
  }

  return (
    <>
      <Header />
      <main>
        <Hero bookRef={book} />
        <Work onOpenInBook={openProject} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
