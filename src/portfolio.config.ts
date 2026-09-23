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
    background: '#e9e4da',
    ink: '#2a2622',
    accent: '#b86543',
    fonts: { display: 'Instrument Serif', body: 'Inter' },
  },

  /* ---------------------------------------------------------------- book --
     pageShape     'portrait' | 'square' | 'landscape'   (shape of ONE page)
     binding       'spiral' | 'stitched' | 'glued'
     paperTexture  'cold-press' | 'smooth' | 'kraft' | 'none'
     cover         the closed book's cover, or false to start open
     material      'cloth' | 'kraft' | 'leather' | 'card'                     */
  book: {
    pageShape: 'portrait',
    binding: 'spiral',
    paper: '#f4efe6',
    paperTexture: 'cold-press',
    printOnPaper: true,
    cover: {
      title: 'Portfolio',
      subtitle: 'Your Name · 2024–26',
      color: '#33413a',
      ink: '#eee4cf',
      material: 'cloth',
      band: '#1f2622',
    },
    ribbon: '#9b3a2a',
    intro: true,
    openAt: 1,
    loupe: true,
    captions: true,
    tabs: true,
    maxHeight: '64vh',
  },

  /* --------------------------------------------------------------- pages --
     Each entry is one OPENING of the book (what you see when it lies open).

     { spread: '/pages/x.webp' }                    one image across both pages
                                                    (an exported A3/A4 landscape
                                                    portfolio page fits exactly)
     { left: '/pages/a.webp', right: '/pages/b.webp' }   one image per page

     alt      describe the images (required — for screen readers and Google)
     caption  shown under the book
     project  the slug of a project below, to link them                     */
  pages: [
    { spread: '/pages/01-title.webp', alt: 'Title page: Portfolio 2024–2026, with a sketch of an arched threshold', caption: 'Portfolio, 2024 — 2026' },
    { spread: '/pages/02-about.webp', alt: 'About me, education, skills and software', caption: 'About' },
    { spread: '/pages/03-contents.webp', alt: 'Contents: three projects', caption: 'Contents' },
    { spread: '/pages/04-cafe-title.webp', alt: 'Courtyard Café: project brief and concept diagram', caption: 'Courtyard Café — concept', project: 'courtyard-cafe' },
    { spread: '/pages/05-cafe-materials.webp', alt: 'Material board: lime plaster, cane, teak, terrazzo, terracotta', caption: 'Courtyard Café — materials', project: 'courtyard-cafe' },
    { spread: '/pages/06-cafe-drawings.webp', alt: 'Ground floor plan and section through the courtyard', caption: 'Courtyard Café — plan and section', project: 'courtyard-cafe' },
    { left: '/pages/07-cafe-sketch.webp', right: '/pages/07-cafe-render.webp', alt: 'Perspective sketch and render of the café interior through the arch', caption: 'Courtyard Café — through the arch', project: 'courtyard-cafe' },
    { spread: '/pages/08-reading-room.webp', alt: 'Reading Room: project brief and axonometric', caption: 'Reading Room — axonometric', project: 'reading-room' },
    { spread: '/pages/09-reading-room-details.webp', alt: 'Shelf joinery detail and wall elevation', caption: 'Reading Room — details', project: 'reading-room' },
    { spread: '/pages/10-studies.webp', alt: 'Sketchbook studies: stairs, windows, roofs, lamps, a lounger', caption: 'Studies', project: 'studies' },
    { spread: '/pages/11-thank-you.webp', alt: 'Thank you, with contact details', caption: 'Thank you' },
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
      color: '#d7a283',
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
      color: '#9fb0c4',
    },
    {
      slug: 'studies',
      title: 'Studies',
      type: 'Sketchbook',
      year: '2024–26',
      summary: 'Things I stop to draw: stairs, windows, market roofs, lamps and chairs.',
      color: '#b9c3a4',
    },
  ],
})
