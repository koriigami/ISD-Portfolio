import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import config from './portfolio.config'
import { trackPage } from './lib/analytics'
import Home from './site/Home'
import ProjectPage from './pages/ProjectPage'
import NotFound from './pages/NotFound'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname === '/') document.title = config.site.title
    window.scrollTo(0, 0)
    trackPage(pathname)
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects/:slug" element={<ProjectPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
