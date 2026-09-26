# Instructions for AI coding assistants

This is an interior design student's portfolio website: a single landing page with an interactive
sketchbook (a book whose pages you drag to turn), plus one page per project. The student is a
designer, not a programmer. Explain what you change in plain words, keep changes small, and make
sure the site still builds.

## Stack

React 19 + Vite + TypeScript, styled with Tailwind CSS v4, deployed on Vercel. Routes use
`react-router` (`/` and `/projects/:slug`). No backend, no database.

## Map

| Path | What it is | May I edit it? |
|---|---|---|
| `src/portfolio.config.ts` | **All content**: name, about text, colours, fonts, book style, pages, projects | Yes, this is the main file |
| `src/site/*.tsx` | Landing page sections: `Header`, `Hero` (holds the sketchbook), `Work`, `About`, `Contact`, `Footer`; `Home.tsx` puts them in order | Yes, freely: this is the student's design space |
| `src/pages/ProjectPage.tsx` | The page for each project | Yes |
| `src/index.css` | Global styles and Tailwind theme tokens | Yes |
| `public/pages/` | Portfolio page images | Yes: add or replace images |
| `node_modules/@kagadmodyaa/sketchbook` | **The sketchbook component**, the npm package `@kagadmodyaa/sketchbook` | **No. Never edit or copy it into `src/`.** |
| `src/lib/*` | Config types, theme loader, Google Analytics | Only if asked |

## Rules

1. **Never modify, copy or replace the `@kagadmodyaa/sketchbook` package.** Change the book only through the `book` block of
   `src/portfolio.config.ts` or the props of `<Sketchbook>` in `src/site/Hero.tsx`. The options are
   documented in `node_modules/@kagadmodyaa/sketchbook/dist/types.d.ts` (read it, don't change it).
2. Keep content in `src/portfolio.config.ts`. Sections read their text from it. Don't hard-code a
   name, email or project into a component.
3. Use the theme tokens in Tailwind classes, not hex codes: `bg-bg`, `text-ink`, `text-accent`,
   `border-ink/15`, `font-display`, `font-body`. To change colours or fonts, edit `theme` in the config.
4. Fonts are Google Fonts loaded by name from `theme.fonts`. Don't add `<link>` tags or font packages.
5. Every image needs meaningful `alt` text.
6. Don't add dependencies unless the student asks for something that truly needs one.
7. After changes, run `npm run build`. It must succeed, because Vercel runs the same command.

## Common tasks

**Add a portfolio page**: put the image in `public/pages/`, then add an entry to `pages`:
```ts
{ spread: '/pages/12-my-page.webp', alt: 'Describe the image', caption: 'Short caption', project: 'my-project-slug' },
// or one image per side of the book:
{ left: '/pages/12a.webp', right: '/pages/12b.webp', alt: '…' },
```
The default book has **square pages**, so a `spread` image should be **2:1** (e.g. 2400×1200) and a
single page square. Images of any other shape still show whole, with paper around them.
Run `npm run images` after adding large images. It shrinks them and updates the file names in the config.

**Change the book**: edit `book` in the config. The easiest way is to let the student design the
book on the Sketchbook page at https://kagadmodyaa.vercel.app/components/sketchbook and paste its
"Copy settings" output over `book`.
Options: `pageShape` (`'square' | 'portrait' | 'landscape'`),
`binding` (`'stitched' | 'spiral' | 'wire-o' | 'coptic' | 'glued'`), `bindingColor` (wire or thread colour),
`paper` (any colour), `paperTexture` (`'hot-press' | 'cold-press' | 'smooth' | 'kraft' | 'dotted' | 'grid' | 'none'`),
`imageFit` (`'contain'` shows images whole, `'cover'` fills the page),
`cover` (`{ title, subtitle, color, ink, material: 'card' | 'cloth' | 'kraft' | 'leather', align: 'left' | 'right', band, image }` or `false`),
`ribbon` (colour or `false`), `intro`, `openAt`, `loupe`, `captions`, `tabs`, `maxHeight`.

**Add a project**: add an object to `projects` (`slug`, `title`, `summary`, optional `type`,
`location`, `area`, `year`, `story`, `images`, `color`) and set `project: '<slug>'` on its pages.

**Redesign the landing page**: edit the files in `src/site/`. The book lives in `Hero.tsx`; you can
move it, change the section around it, or add new sections. Keep `<Sketchbook … />` and its props.

**Jump the book to a project from elsewhere on the page**: `Home.tsx` holds a ref:
`book.current?.goToProject('slug')` or `book.current?.goTo(3)`.

## Design direction

This is a designer's portfolio, and generic "AI template" design reflects badly on them. Prefer
restraint: generous space, a clear type hierarchy (one display font, one text font), one accent
colour, real content. Avoid gradient blobs, glowing buttons, emoji, stock "features" card grids,
fake testimonials and badges. The work in the book is the hero; the page around it should frame it
quietly, like a gallery wall.

## Commands

```bash
npm install      # once, after downloading the project
npm run dev      # preview at http://localhost:5173 (updates as you save)
npm run build    # what Vercel runs; must pass
npm run check    # optional TypeScript check
npm run images   # shrink new images in public/pages/
```
