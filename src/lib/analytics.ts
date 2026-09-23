/* Google Analytics 4. Loaded only when VITE_GA_ID is set (see .env.example).
   Besides page views, the sketchbook reports which pages people turn to and
   open, so you can see which projects hold attention. */

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

const id = import.meta.env.VITE_GA_ID as string | undefined

export function initAnalytics() {
  if (!id || window.gtag) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js expects the arguments object itself
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
}

export function trackPage(path: string) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: location.href, page_title: document.title })
}

export function track(name: string, params: Record<string, string | number> = {}) {
  window.gtag?.('event', name, params)
}
