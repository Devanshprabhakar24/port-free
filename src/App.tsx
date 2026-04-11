import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import MainLayout from './layout/MainLayout'
import TransitionWrapper from './components/TransitionWrapper/TransitionWrapper'
import { useRoutePreload } from './hooks/useRoutePreload'

// ⚡ OPTIMIZATION: Lazy-load non-critical pages to reduce initial JS bundle
// Home is NOT lazy since it's the landing page (critical path)
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
const Contact = lazy(() => import('./pages/Contact'))

function RouteFallback() {
  return <div className="relative z-10 min-h-screen bg-transparent" aria-hidden="true" />
}

function AppContent() {
  // ⚡ Preload all route chunks in background
  useRoutePreload()

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<TransitionWrapper />}>
          {/* Home is critical, load immediately */}
          <Route index element={<Suspense fallback={<RouteFallback />}><Home /></Suspense>} />
          
          {/* Secondary routes with Suspense fallback */}
          <Route path="about" element={<Suspense fallback={<RouteFallback />}><About /></Suspense>} />
          <Route path="dashboard" element={<Suspense fallback={<RouteFallback />}><Dashboard /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={<RouteFallback />}><Projects /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<RouteFallback />}><Contact /></Suspense>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
