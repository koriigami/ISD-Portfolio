import type { BookOptions } from '../sketchbook'

/* Turns the panel's choices into text a student can paste. */

const ORDER: (keyof BookOptions)[] = [
  'pageShape', 'binding', 'bindingColor', 'paper', 'paperTexture', 'printOnPaper', 'imageFit',
  'cover', 'ribbon', 'intro', 'openAt', 'loupe', 'captions', 'tabs', 'maxHeight',
]

function value(v: unknown, indent: string): string {
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (v && typeof v === 'object') {
    const inner = Object.entries(v)
      .filter(([, x]) => x !== undefined)
      .map(([k, x]) => `${indent}  ${k}: ${value(x, indent + '  ')},`)
      .join('\n')
    return `{\n${inner}\n${indent}}`
  }
  return String(v)
}

/** A `book: { … },` block, ready for portfolio.config.ts. */
export function bookSnippet(book: BookOptions): string {
  const lines = ORDER.filter(k => book[k] !== undefined).map(k => `    ${k}: ${value(book[k], '    ')},`)
  return `  book: {\n${lines.join('\n')}\n  },`
}

/** The same, wrapped as an instruction for an AI assistant. */
export function bookPrompt(book: BookOptions): string {
  return [
    'In src/portfolio.config.ts, replace the whole `book: { … },` block with the block below.',
    "Don't change anything else, and don't edit src/sketchbook/. Then run `npm run build` to check it still builds.",
    '',
    '```ts',
    bookSnippet(book),
    '```',
  ].join('\n')
}

export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // older browsers, or no permission: fall back to a hidden textarea
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}
