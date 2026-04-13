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

  const sectionIds = useMemo(() => ['hero', 'about', 'services', 'projects', 'contact'] as SectionId[], [])
  const { currentSection } = useScrollSection(sectionIds)

  const heroNear = useSectionNearViewport('hero', '200px')
  const aboutNear = useSectionNearViewport('about', '200px')
  const contactNear = useSectionNearViewport('contact', '200px')

  const scrollToSection = (section: SectionId) => {
    const element = document.getElementById(section)
    if (!element) {
      return
    }

    // Calculate offset - services and contact sections should start a bit higher
    const offset = section === 'services' || section === 'contact' ? -100 : 0
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition + offset

    window.scrollTo({
      top: offsetPosition,
      behavior: reducedMotion ? 'auto' : 'smooth',
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
            shouldRenderScene={heroNear}
          />
        </section>

        <section id="about" data-scroll-section className="min-h-screen">
          <About mouse={mouse} shouldRenderScene={aboutNear} />
        </section>

        <section id="services" data-scroll-section className="min-h-screen">
          <div className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 md:py-20">
            <div className="mx-auto mb-6 grid w-full max-w-7xl gap-4 sm:gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[24px] border border-white/10 bg-white/3 p-6 backdrop-blur-xl sm:rounded-[28px] sm:p-8">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#7c3aed]">SERVICES</p>
                <h2 className="max-w-2xl text-[clamp(26px,5vw,52px)] font-black leading-[1.15] tracking-[-0.03em] text-white sm:text-[clamp(30px,3.2vw,52px)] sm:leading-[1.1]">
                  What I Can Build For You
                </h2>
                <p className="mt-4 max-w-xl text-[14px] leading-[1.7] text-slate-300 sm:mt-6 sm:text-[15px] sm:leading-[1.8]">
                  I help businesses build and improve web applications with scalable architecture and clean code.
                </p>
              </div>

              <div className="grid gap-3 sm:gap-4">
                {[
                  ['Full Stack Web Apps', 'Complete web applications from frontend to backend'],
                  ['Backend & APIs', 'Secure, scalable backend systems with proper architecture'],
                  ['Dashboards & Admin Panels', 'Custom dashboards to manage users, data, and analytics'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[20px] border border-white/10 bg-white/3 p-5 backdrop-blur-xl sm:rounded-[24px] sm:p-6">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]">{label}</div>
                    <div className="mt-2 text-[15px] font-semibold leading-[1.4] text-white sm:mt-3 sm:text-lg">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" data-scroll-section className="min-h-screen">
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
