import { memo, useCallback, useMemo, useState } from 'react'
import MainLayout from './layout/MainLayout'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Projects from './components/Projects/Projects'
import Contact from './components/Contact/Contact'
import Trust from './components/Trust/Trust'
import CTA from './components/CTA/CTA'
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

        <section id="services" data-scroll-section className="relative min-h-screen">
          {/* Dark overlay to ensure text is perfectly readable against the bright planet bg */}
          <div className="pointer-events-none absolute inset-0 bg-black/60 backdrop-blur-[3px]" aria-hidden="true" />
          
          <div className="relative z-10 mx-auto min-h-[90vh] flex flex-col justify-center max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            {/* Section Header */}
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#7c3aed]">Technical Solutions for Business Growth</p>
              <h2 className="mb-6 text-[clamp(28px,5vw,52px)] font-black leading-[1.15] tracking-[-0.03em] text-white">
                Services That <span className="text-gradient">Drive Results</span>
              </h2>
              <p className="mx-auto max-w-2xl text-[16px] leading-[1.8] text-slate-300 sm:text-[18px]">
                I don't just write code — I build scalable systems that handle real users and grow with your business.
              </p>
            </div>

            {/* Service Cards Grid */}
            <div className="mx-auto grid w-full gap-6 lg:grid-cols-3">
              {[
                {
                  icon: '🚀',
                  title: 'Custom SaaS & Web Apps',
                  whatItDoes: 'End-to-end web applications built from the ground up to serve your users seamlessly.',
                  whyItMatters: 'Turn your idea into a launched product quickly without sacrificing quality, security, or the ability to scale as your user base grows.'
                },
                {
                  icon: '⚙️',
                  title: 'Backend Systems & APIs',
                  whatItDoes: 'Powerful, secure, and robust server architectures and databases that power your business logic.',
                  whyItMatters: 'Stop worrying about crashes or slow load times. Ensure your platform handles heavy traffic and processes data efficiently.'
                },
                {
                  icon: '📊',
                  title: 'Dashboards & Admin Panels',
                  whatItDoes: 'Custom management dashboards that connect directly to your business data.',
                  whyItMatters: 'Stop tracking operations on disorganized spreadsheets. Save hours of time with automated tools that give you a birds-eye view of your business.'
                }
              ].map((service) => (
                <div
                  key={service.title}
                  className="group flex flex-col rounded-[24px] border border-white/10 bg-[#050508]/80 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-[#0a0a10]/90 hover:shadow-[0_15px_40px_rgba(124,58,237,0.15)]"
                >
                  <div className="mb-6 text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 origin-left">{service.icon}</div>
                  <h3 className="mb-4 text-[22px] font-bold text-white">{service.title}</h3>
                  
                  <div className="mb-5 flex-1">
                    <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-violet-400">What it does</p>
                    <p className="text-[15px] leading-[1.7] text-slate-300">{service.whatItDoes}</p>
                  </div>
                  
                  <div className="border-t border-white/10 pt-5">
                    <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-emerald-400">Why it matters</p>
                    <p className="text-[15px] leading-[1.7] text-slate-300">{service.whyItMatters}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA below services */}
            <div className="mx-auto mt-16 max-w-2xl text-center">
              <button
                onClick={() => {
                  const el = document.getElementById('contact')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-8 py-4 text-[16px] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-violet-400/60 hover:bg-violet-500/20 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
              >
                Let's Discuss Your Project
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
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
