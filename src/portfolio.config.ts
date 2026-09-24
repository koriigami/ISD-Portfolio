import { defineConfig } from './lib/config'

/* ============================================================================
   YOUR PORTFOLIO — this is the main file you edit.

   1. Put your page images in  public/pages/  (JPG, PNG or WebP).
      Run  npm run images  to shrink them for the web.
   2. List them under `pages` below, in the order of your book.
   3. Change your name, colours, fonts and book style.

   Everything on the site reads from here. Save, and the page updates.
   ========================================================================= */

export default defineConfig({
  site: {
    title: 'Your Name — Interior Design Portfolio',
    description: 'Selected interior space design work, 2024–2026.',
  },

  student: {
    name: 'Your Name',
    tagline: 'Interior Space Design · Class of 2026',
    location: 'Ahmedabad, India',
    email: 'you@email.com',
    about: [
      'I design interiors that start from what is already there — a tree, an old wall, the way light enters at four in the afternoon.',
      'Replace these lines with two or three sentences about how you see space, and what kind of places you want to make.',
    ],
    links: [
      { label: 'Behance', href: 'https://www.behance.net/' },
      { label: 'Instagram', href: 'https://www.instagram.com/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    ],
  },

  theme: {
    background: '#e6e5e1',
    ink: '#22313a',
    accent: '#2f6173',
    fonts: { display: 'Jost', body: 'Inter' },
  },

  /* ---------------------------------------------------------------- book --
     Tip: design your book at https://kagadmodyaa.vercel.app/components/sketchbook
     and paste its Copy settings over this block.

     pageShape     'square' | 'portrait' | 'landscape'   (shape of ONE page;
                   square opens to a 2:1 spread — export spreads at 2400×1200)
     binding       'stitched' | 'spiral' | 'wire-o' | 'coptic' | 'glued'
     bindingColor  wire colour (spiral, wire-o) or thread colour (stitched, coptic)
     paper         any colour; dark papers are fine
     paperTexture  'hot-press' | 'cold-press' | 'smooth' | 'kraft' | 'dotted' | 'grid' | 'none'
     imageFit      'contain' (show every image whole) | 'cover' (fill the page)
     cover         the closed book's cover, or false to start open
       material    'card' | 'cloth' | 'kraft' | 'leather'
       align       'left' | 'right'   (where the title sits)
       image       your own cover artwork, e.g. '/pages/cover.webp'           */
  book: {
    pageShape: 'square',
    binding: 'stitched',
    paper: '#f6f5f1',
    paperTexture: 'hot-press',
    printOnPaper: true,
    imageFit: 'contain',
    cover: {
      title: 'portfolio',
      subtitle: 'Your Name · selected works 2024–26',
      color: '#ecebe7',
      ink: '#2f5f70',
      material: 'card',
      align: 'right',
    },
    ribbon: false,
    intro: true,
    openAt: 1,
    loupe: true,
    captions: true,
    tabs: true,
    maxHeight: '62vh',
  },

  /* --------------------------------------------------------------- pages --
     Each entry is one OPENING of the book (what you see when it lies open).

     { spread: '/pages/x.webp' }                    one image across both pages
                                                    (a 2:1 spread for a square book)
     { left: '/pages/a.webp', right: '/pages/b.webp' }   one image per page

     alt      describe the images (required — for screen readers and Google)
     caption  shown under the book
     project  the slug of a project below, to link them                     */
  pages: [
    { spread: '/pages/01-title.webp', alt: 'Title page: interior design portfolio, selected works 2024–2026, with a line drawing of a chair', caption: 'Portfolio, 2024 — 2026' },
    { spread: '/pages/02-about.webp', alt: 'About me: photo, education, experience, skills and tools', caption: 'About' },
    { spread: '/pages/03-contents.webp', alt: 'Contents: three projects', caption: 'Contents' },
    { spread: '/pages/04-cafe-title.webp', alt: 'Courtyard Café: project brief and concept diagram of sun and breeze', caption: 'Courtyard Café — concept', project: 'courtyard-cafe' },
    { spread: '/pages/05-cafe-layout.webp', alt: 'Bubble diagram of zones and the floor plan on a structural grid', caption: 'Courtyard Café — layout', project: 'courtyard-cafe' },
    { spread: '/pages/06-cafe-materials.webp', alt: 'Material board: lime plaster, cane, oak, terrazzo, terracotta', caption: 'Courtyard Café — materials', project: 'courtyard-cafe' },
    { left: '/pages/07-cafe-sketch.webp', right: '/pages/07-cafe-render.webp', alt: 'Perspective sketch and render of the café interior through the arch', caption: 'Courtyard Café — through the arch', project: 'courtyard-cafe' },
    { spread: '/pages/08-reading-room.webp', alt: 'Reading Room: project brief and a render of the shelving wall', caption: 'Reading Room', project: 'reading-room' },
    { spread: '/pages/09-reading-room-details.webp', alt: 'Shelf joinery detail and wall elevation', caption: 'Reading Room — details', project: 'reading-room' },
    { spread: '/pages/10-studies.webp', alt: 'Sketchbook studies: stairs, windows, roofs, lamps, a lounger', caption: 'Studies', project: 'studies' },
    { spread: '/pages/11-thank-you.webp', alt: 'Thank you, with a QR code and contact details', caption: 'Thank you' },
  ],

  /* ------------------------------------------------------------ projects --
     Each project gets a page at /projects/<slug> and an index tab on the book. */
  projects: [
    {
      slug: 'courtyard-cafe',
      title: 'Courtyard Café',
      type: 'Commercial',
      location: 'Ahmedabad',
      area: '180 m²',
      year: '2025',
      summary: 'A neighbourhood café built around an existing neem tree, kept cool without air-conditioning.',
      story: [
        'The site was a single-storey house with a courtyard and a forty-year-old neem. The brief asked for seating for forty and a kitchen, without losing the tree.',
        'The courtyard became the room: tables sit under the canopy, a terracotta jaali filters the street, and lime-plastered walls keep the heat out. Reclaimed teak from the old doors became the counter.',
      ],
      color: '#d9b8a6',
    },
    {
      slug: 'reading-room',
      title: 'Reading Room',
      type: 'Residential',
      location: 'Pune',
      area: '22 m²',
      year: '2025',
      summary: 'A small apartment room turned into a family library, with shelves that fold into a window seat.',
      story: ['One wall does everything: shelving, a desk, and a window seat with storage under a lift-up lid. Built in 18 mm reclaimed teak with housed dado joints.'],
      color: '#a9bfcc',
    },
    {
      slug: 'studies',
      title: 'Studies',
      type: 'Sketchbook',
      year: '2024–26',
      summary: 'Things I stop to draw: stairs, windows, market roofs, lamps and chairs.',
      color: '#c2cbb4',
    },
  ],
})
