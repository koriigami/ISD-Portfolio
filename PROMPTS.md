# Prompts for your AI assistant

Copy one, change the details, and paste it into Antigravity or VS Code chat. Ask for one thing at a
time, look at the result in your browser, then ask for the next.

## Start here

> Read AGENTS.md. Then change portfolio.config.ts with my details: my name is ___, I study ___ at
> ___, I'm based in ___, my email is ___. Rewrite the About text from these notes: ___.

> I added my portfolio pages to public/pages. List them all in the `pages` section of
> portfolio.config.ts in filename order, as spreads, with good alt text and short captions.
> Group them into projects: pages 4–7 are "___", pages 8–10 are "___".

## The book

The quickest way: open the Sketchbook page at
https://kagadmodyaa.vercel.app/components/sketchbook, pick a look, press **Copy as AI prompt**, and
paste that into the chat. Or describe it:

> Make the book a Coptic-bound sketchbook with kraft paper and a brown leather cover titled "___".

> Change the book to a gold Wire-O binding on dotted paper, with a black cloth cover and no ribbon.

> Make the book open straight to the page about my thesis project instead of the first page.

## The page around it

> Redesign the Hero section so the book sits on a dark walnut desk: a warm, dim background with a
> soft pool of light on the book. Keep it subtle and keep the text readable.

> Change my fonts to "Fraunces" for headings and "Work Sans" for text, and make the accent colour
> a muted terracotta.

> Move my name into a large heading above the book, left-aligned, with my tagline under it.

> Add a section after Work called "Process" with three photos of my physical models from
> public/process/, in a simple row with captions.

> Redesign the Work section as a two-column grid where each project shows its first page as a thumbnail.

## When something breaks

> `npm run build` fails with this error: ___. Fix it without changing the @kagadmodyaa/sketchbook package.

> The site looks broken on my phone. Check src/site for layouts that don't fit a 390px-wide screen
> and fix them.

## Good habits

- Say what you want it to **look** and **feel** like, not how to code it.
- Refer to real things: "like the spacing on ___'s website", "like a gallery label".
- If you don't like a change, say "undo that" or use *Source Control → Discard changes*.
- Commit after each change you like, so you can always go back.
