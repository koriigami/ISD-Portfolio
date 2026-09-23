import type { PortfolioConfig } from './config'

/* Turns the `theme` block of portfolio.config.ts into CSS variables and
   loads the chosen Google Fonts. */
export function applyTheme(theme: PortfolioConfig['theme']) {
  const root = document.documentElement.style
  root.setProperty('--bg', theme.background)
  root.setProperty('--ink', theme.ink)
  root.setProperty('--accent', theme.accent)
  root.setProperty('--font-display-family', `'${theme.fonts.display}', Georgia, serif`)
  root.setProperty('--font-body-family', `'${theme.fonts.body}', system-ui, sans-serif`)

  const families = [...new Set([theme.fonts.display, theme.fonts.body])]
  families.forEach((family, i) => loadFont(family, `theme-font-${i}`))
}

/* Google Fonts refuses a request for weights or italics a family doesn't
   have, so ask for the most first and settle for less. */
function loadFont(family: string, id: string) {
  const name = encodeURIComponent(family).replace(/%20/g, '+')
  const tries = [
    `${name}:ital,wght@0,300..700;1,300..700`,
    `${name}:wght@300..700`,
    `${name}:ital@0;1`,
    name,
  ]
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  let k = 0
  const next = () => { link!.href = `https://fonts.googleapis.com/css2?family=${tries[k]}&display=swap` }
  link.onerror = () => { if (++k < tries.length) next() }
  next()
}
