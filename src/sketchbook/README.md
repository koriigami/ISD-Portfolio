# Kagad Modiya Sketchbook: engine

> **Students and AI assistants: don't edit this folder.** Configure the book from
> `src/portfolio.config.ts` or through `<Sketchbook>` props (see `types.ts`).

A page-turning sketchbook for React, built from DOM + CSS 3D transforms, with no WebGL and no
dependencies beyond React.

```tsx
import { Sketchbook } from './sketchbook'

<Sketchbook
  pages={[{ spread: '/pages/01.webp', alt: '…' }, { left: '/a.webp', right: '/b.webp', alt: '…' }]}
  book={{ binding: 'spiral', cover: { title: 'Portfolio' } }}
/>
```

## How it works

| File | Role |
|---|---|
| `engine/model.ts` | Positions: 0 = closed cover, n = n-th opening. L(n)/R(n) faces. A forward turn lifts R(n) and its back is L(n+1). |
| `engine/leaf.ts` | The turning sheet: a chain of nested strips, each rotated a little relative to its parent, so the sheet bows. Bending is weighted towards the spine and fades to flat at both ends of the turn. Each strip is shaded at both edges from its angle. The cover is one rigid strip. |
| `engine/paint.ts` | Paints a face or a vertical slice of one as CSS backgrounds, fitted to its frame (one page, or the whole spread for images crossing the fold): whole by default, or filling the page. |
| `engine/engine.ts` | State, DOM building, turn control (drag, tap, keys, springs, riffle), tilt/zoom, captions, deep links (`#page-n`). React renders the skeleton once; the engine writes styles and CSS variables per frame. |
| `engine/loupe.ts` | Magnifier: a masked, scaled copy of the resting spread under a draggable glass. |
| `engine/chrome.ts` | Paper surfaces (tooth, dot and line grids), cover materials, and the bindings (spiral, Wire-O, stitched, Coptic, glued), generated as inline SVG. |
| `engine/motion.ts` | Spring and tween. |
| `Sketchbook.tsx`, `Lightbox.tsx` | React wrapper and the larger-view dialog. |
| `sketchbook.css` | All styles, themed through `--skb-*` custom properties. |

Interaction: a drag turns the page. A tap (under 7 px of movement) opens the larger view. Arrow keys
turn pages; `+`/`-`/`0` zoom when the book has focus. `prefers-reduced-motion` swaps turns for a fade.

MIT © Kagad Modiya
