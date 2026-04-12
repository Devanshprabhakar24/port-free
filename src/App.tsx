import { memo, useCallback, useMemo, useState } from 'react'
import MainLayout from './layout/MainLayout'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Projects from './components/Projects/Projects'
import Contact from './components/Contact/Contact'
import Loader from './components/Loader/Loader'
import { useMousePosition } from './hooks/useMousePosition'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { useScrollSection, useSectionNearViewport } from './hooks/useScrollSection'
import type { SectionId } from './store/scrollSectionStore'

function App() {
  const mouse = useMousePosition()
  const reducedMotion = usePrefersReducedMotion()
  const [loading, setLoading] = useState(true)
  const handleLoaderComplete = useCallback(() => {
    setLoading(false)
  }, [])

  const sectionIds = useMemo(() => ['hero', 'about', 'projects', 'contact'] as SectionId[], [])
  const { currentSection } = useScrollSection(sectionIds)

  const heroNear = useSectionNearViewport('hero', '200px')
  const aboutNear = useSectionNearViewport('about', '200px')
  const contactNear = useSectionNearViewport('contact', '200px')

  const scrollToSection = (section: SectionId) => {
    const element = document.getElementById(section)
    if (!element) {
      return
    }

    element.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      {loading ? <Loader onComplete={handleLoaderComplete} /> : null}

      <MainLayout mouse={mouse} currentSection={currentSection} onNavigate={scrollToSection}>
        <section id="hero" data-scroll-section className="min-h-screen">
          <Hero
            mouse={mouse}
            onViewProjects={() => scrollToSection('projects')}
            onHireMe={() => scrollToSection('contact')}
            shouldRenderScene={heroNear}
          />
        </section>

        <section id="about" data-scroll-section className="min-h-screen">
          <About mouse={mouse} shouldRenderScene={aboutNear} />
        </section>

        <section id="projects" data-scroll-section className="min-h-screen">
          <div className="relative min-h-screen px-6 pb-8 pt-24 lg:px-[48px]">
            <div className="mx-auto mb-8 grid w-full max-w-7xl gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/3 p-8 backdrop-blur-xl">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7c3aed]">SYSTEM DASHBOARD</p>
                <h2 className="max-w-2xl text-[clamp(34px,3.4vw,56px)] font-black leading-[0.95] tracking-[-0.03em] text-white">
                  A calmer cockpit for modern product delivery.
                </h2>
                <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-slate-300">
                  This control layer remains in the same universe while you scroll deeper into projects.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  ['Latency', '12ms'],
                  ['Motion', 'Smooth'],
                  ['Theme', 'Nebula'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-white/10 bg-white/3 p-6 backdrop-blur-xl">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</div>
                    <div className="mt-3 text-3xl font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Projects mouse={mouse} />
        </section>

        <section id="contact" data-scroll-section className="min-h-screen">
          <Contact mouse={mouse} shouldRenderScene={contactNear} />
        </section>
      </MainLayout>
    </>
  )
}

export default memo(App)
