import { memo } from 'react'
import type { ReactNode } from 'react'
import { LayoutGroup } from 'framer-motion'
import Navbar from '../components/Navbar/Navbar'
import Background from '../components/Background/Background'
import PlanetSystem from '../components/PlanetSystem/PlanetSystem'
import Footer from '../components/Footer/Footer'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import type { MousePosition } from '../hooks/useMousePosition'
import Cursor from '../components/Cursor/Cursor'
import TransitionTunnel from '../components/Transition/TransitionTunnel'
import type { SectionId } from '../store/scrollSectionStore'
import { useLenis } from '../hooks/useLenis'

type MainLayoutProps = {
  mouse: MousePosition
  currentSection: SectionId
  onNavigate: (section: SectionId) => void
  children: ReactNode
}

function MainLayout({ mouse, currentSection, onNavigate, children }: MainLayoutProps) {
  useLenis(true)

  return (
    <ErrorBoundary>
      <LayoutGroup id="universe-layout">
        <div className="relative min-h-screen overflow-hidden bg-[#03010a] text-[#f1f5f9]">
          <Background />
          <PlanetSystem />
          <Navbar mouse={mouse} currentSection={currentSection} onNavigate={onNavigate} />
          <Cursor mouse={mouse} />
          <TransitionTunnel />
          <main className="relative z-10">
            {children}
          </main>
          <Footer />
        </div>
      </LayoutGroup>
    </ErrorBoundary>
  )
}

export default memo(MainLayout)