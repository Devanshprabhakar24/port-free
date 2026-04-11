import { memo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutGroup } from 'framer-motion'
import Navbar from '../components/Navbar/Navbar'
import Background from '../components/Background/Background'
import PlanetSystem from '../components/PlanetSystem/PlanetSystem'
import Footer from '../components/Footer/Footer'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import { useMousePosition } from '../hooks/useMousePosition'
import { useEffect } from 'react'
import { useNavigationStore } from '../store/navigationStore'

function MainLayout() {
  const mouse = useMousePosition()
  const location = useLocation()
  const commitPath = useNavigationStore((s) => s.commitPath)

  useEffect(() => {
    commitPath(location.pathname)
  }, [commitPath, location.pathname])

  return (
    <ErrorBoundary>
      <LayoutGroup id="universe-layout">
        <div className="relative min-h-screen overflow-hidden bg-[#03010a] text-[#f1f5f9]">
          <Background />
          <PlanetSystem />
          <Navbar mouse={mouse} />
          <main className="relative z-10">
            <Outlet />
          </main>
          <Footer />
        </div>
      </LayoutGroup>
    </ErrorBoundary>
  )
}

export default memo(MainLayout)