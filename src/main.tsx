import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import config from './portfolio.config'
import { initAnalytics } from './lib/analytics'
import { applyTheme } from './lib/theme'
import '@kagadmodyaa/sketchbook/style.css'
import './index.css'

applyTheme(config.theme)
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
