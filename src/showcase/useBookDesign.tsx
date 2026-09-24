import { lazy, Suspense, useState, type RefObject } from 'react'
import type { BookOptions, SketchbookHandle } from '../sketchbook'

/* The "Design your book" panel from the Kagad Modiya demo.

   It appears while you run the site on your own computer (npm run dev) and
   on the public demo (VITE_SHOWCASE=true). On your published portfolio it
   isn't there at all: the panel's code isn't even included in the build. */
export const showcaseEnabled = import.meta.env.DEV || import.meta.env.VITE_SHOWCASE === 'true'

const DesignPanel = showcaseEnabled ? lazy(() => import('./DesignPanel')) : null

export function useBookDesign(initial: BookOptions, bookRef: RefObject<SketchbookHandle | null>) {
  const [book, setBook] = useState<BookOptions>(initial)
  const panel = DesignPanel ? (
    <Suspense fallback={null}>
      <DesignPanel book={book} initial={initial} onChange={setBook} bookRef={bookRef} />
    </Suspense>
  ) : null
  return { book: DesignPanel ? book : initial, panel }
}
