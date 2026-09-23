/* Kagad Modiya Sketchbook — public types.
   Everything a portfolio can say about its book lives here. */

/** One opening of the book: what you see when it lies open. */
export type SketchbookPage = SpreadPage | PairPage

type PageCommon = {
  /** Describe the page for screen readers and search engines. Required. */
  alt: string
  /** Short line shown under the book while this opening is visible. */
  caption?: string
  /** Slug of a project in `projects`; links the page to that project. */
  project?: string
}

/** One image laid across both pages, split at the fold.
 *  Use this for an exported A3/A4 landscape portfolio page. */
export type SpreadPage = PageCommon & { spread: string; left?: never; right?: never }

/** A separate image for each side. Either side may be left blank. */
export type PairPage = PageCommon & { spread?: never; left?: string; right?: string }

/** The shape of ONE page. The open book is two of these side by side. */
export type PageShape = 'portrait' | 'square' | 'landscape'
export type Binding = 'spiral' | 'stitched' | 'glued'
export type PaperTexture = 'cold-press' | 'smooth' | 'kraft' | 'none'
export type CoverMaterial = 'cloth' | 'kraft' | 'leather' | 'card'

export type CoverOptions = {
  title: string
  subtitle?: string
  /** Board colour, any CSS colour. */
  color?: string
  /** Colour of the title lettering. */
  ink?: string
  material?: CoverMaterial
  /** Optional artwork for the front board (fills it). */
  image?: string
  /** An elastic band across the front board, like a pocket notebook. */
  band?: string | false
}

export type BookOptions = {
  pageShape?: PageShape
  binding?: Binding
  /** Paper colour, any CSS colour. Page images are printed onto it. */
  paper?: string
  paperTexture?: PaperTexture
  /** When true, whites in your images take the paper colour (looks printed). */
  printOnPaper?: boolean
  /** 'contain' (default) shows every image whole, with paper around it if its
   *  shape differs from the page. 'cover' fills the page and trims the rest. */
  imageFit?: 'contain' | 'cover'
  /** The book starts closed on this cover. `false` starts open. */
  cover?: CoverOptions | false
  /** Ribbon bookmark colour, or false for none. */
  ribbon?: string | false
  /** Open the cover and riffle through to `openAt` when the page loads. */
  intro?: boolean
  /** Which opening (1 = first page in `pages`) to settle on after the intro. */
  openAt?: number
  /** Draggable magnifying glass (desktop only). */
  loupe?: boolean
  captions?: boolean
  /** Coloured index tabs on the page edge, one per project. */
  tabs?: boolean
  /** Largest height the book may take, as a CSS length. */
  maxHeight?: string
}

export type SketchbookProject = {
  slug: string
  title: string
  /** Tab colour for this project. */
  color?: string
}

export type SketchbookEvent =
  | { type: 'turn'; opening: number; total: number }
  | { type: 'open'; opening: number; side: 'left' | 'right' | 'spread' }

export type SketchbookProps = {
  pages: SketchbookPage[]
  book?: BookOptions
  projects?: SketchbookProject[]
  className?: string
  /** Label for assistive technology. */
  label?: string
  onEvent?: (event: SketchbookEvent) => void
  /** Called when a page is clicked or tapped. Return true to stop the
   *  built-in larger view from opening. */
  onPageClick?: (opening: number, side: 'left' | 'right') => boolean | void
  /** Href for a project page, used by the larger view's "View project" link. */
  projectHref?: (slug: string) => string
}

/** Imperative handle: `const book = useRef<SketchbookHandle>(null)`. */
export type SketchbookHandle = {
  /** Go to an opening (1-based, like `openAt`). 0 closes the book. */
  goTo: (opening: number) => void
  goToProject: (slug: string) => void
  next: () => void
  prev: () => void
  /** Current opening, 0 when closed. */
  current: () => number
}
