# Sketchbook Portfolio

A portfolio website for interior design students. Your work sits in an interactive sketchbook:
visitors drag pages to turn them, lift a magnifying glass over your drawings, and click any page to
see it large. Around the book is a landing page that you design yourself, with the help of an AI
assistant.

Sketchbook engine by [Kagadmodyaa](https://kagadmodyaa.com). Free to use.

---

## 1. Get your own copy (10 minutes, nothing to install)

1. Make a free account on [GitHub](https://github.com/signup). This is where your website's files live.
2. Make a free account on [Vercel](https://vercel.com/signup) and choose **Continue with GitHub**.
   Vercel puts your website on the internet.
3. Click this button:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkoriigami%2FISD-Portfolio&project-name=my-portfolio&repository-name=my-portfolio)

   Vercel copies this project into your GitHub account and publishes it. In about a minute you get
   a link like `my-portfolio-yourname.vercel.app`. That's your site.

## 2. Set up your computer (once)

Install these three, accepting the default options:

| | Windows | Mac |
|---|---|---|
| **Node.js** (runs the site on your computer) | [nodejs.org](https://nodejs.org), the **LTS** version | same |
| **Git** (sends your changes to GitHub) | [git-scm.com/download/win](https://git-scm.com/download/win) | Open Terminal, type `git --version`, and accept the prompt to install |
| **An editor with AI** | [Google Antigravity](https://antigravity.google) or [VS Code](https://code.visualstudio.com) | same |

Then, in your editor: **Clone Repository** → sign in with GitHub → pick `my-portfolio`.
Open the editor's terminal and run:

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. This is your site, live on your computer. It updates every time you save.

## 3. Put your work in the book

1. Export your portfolio pages as images (JPG or PNG). The book has square pages, so export each
   **two-page spread as one 2:1 image** (for example 2400×1200 px). From InDesign: *File → Export → JPEG*
   with "Spreads" ticked. From Canva or Acrobat: download or export as JPG. Other shapes still work;
   they show whole, with paper around them.
2. Drop them into the `public/pages/` folder.
3. Run `npm run images` to shrink them for the web.
4. Open `src/portfolio.config.ts` and list your pages under `pages`:

```ts
// one 2:1 spread = one opening of the book
{ spread: '/pages/my-cafe-plans.webp', alt: 'Plan and section of the café', caption: 'Café: drawings', project: 'cafe' },

// or a separate image on each side
{ left: '/pages/sketch.webp', right: '/pages/render.webp', alt: 'Sketch and render', caption: 'Café: interior' },
```

In the same file, change your name, about text, email, colours and fonts.

**Design your book.** Open the Sketchbook page at
[kagadmodyaa.vercel.app/components/sketchbook](https://kagadmodyaa.vercel.app/components/sketchbook)
and try the page shape, binding (stitched, spiral, Wire-O, Coptic, glued), wire or thread colour,
paper colour and texture (hot-press, cold-press, kraft, dotted, grid…), cover colour, material and
title position, ribbon and tabs. When you like it, press **Copy settings** and paste it over the
`book: { … }` block in `src/portfolio.config.ts` (or press **Copy as AI prompt** and give it to your
AI assistant).

## 4. Design your landing page with AI

Everything around the book is yours to design. The files are in `src/site/`, one per section.
Ask your AI assistant for what you want. The file `AGENTS.md` tells it the rules of this project.
See **[PROMPTS.md](PROMPTS.md)** for prompts that work well.

## 5. Publish your changes

In your editor's **Source Control** panel: write a short message (e.g. "add café project"),
click **Commit**, then **Sync / Push**. Vercel sees the change and updates your live site in about a
minute.

## 6. See who visits: Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com) → **Start measuring** → create a
   *Property* → choose **Web** → enter your Vercel link.
2. Copy the **Measurement ID** (looks like `G-AB12CD34EF`).
3. In Vercel: your project → **Settings → Environment Variables** → add `VITE_GA_ID` = your ID →
   **Save**, then **Deployments → ⋯ → Redeploy**.

Besides visits, the site reports `sketchbook_turn` (which pages people turn to), `sketchbook_open`
(which pages they click to see large) and `project_view`. Find them under *Reports → Engagement → Events*.
To test on your own computer, copy `.env.example` to `.env.local` and put the ID there.

## 7. Your own domain (optional)

Vercel → your project → **Settings → Domains**, then add a domain you own.

---

## Commands

| | |
|---|---|
| `npm run dev` | Preview on your computer |
| `npm run build` | Build the site exactly as Vercel does. Run it if a deploy fails |
| `npm run images` | Shrink images in `public/pages/` |

## Project layout

```
src/portfolio.config.ts   ← your content, colours, fonts and book style
src/site/                 ← your landing page, one file per section
src/pages/                ← project pages
public/pages/             ← your portfolio images
```

## For maintainers

The sample pages in `public/pages/` are drawn in `scripts/samples/samples.html` and rendered with
`NODE_PATH="$(npm root -g)" node scripts/samples/make-samples.mjs` (needs Playwright). The sketchbook
component is the npm package [`@kagadmodyaa/sketchbook`](https://www.npmjs.com/package/@kagadmodyaa/sketchbook);
update it with `npm i @kagadmodyaa/sketchbook@latest`.
