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
            {/* Section Header */}
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#7c3aed]">What I Offer</p>
              <h2 className="mb-5 text-[clamp(28px,5vw,52px)] font-black leading-[1.15] tracking-[-0.03em] text-white">
                Services That <span className="text-gradient">Drive Results</span>
              </h2>
              <p className="mx-auto max-w-2xl text-[16px] leading-[1.8] text-slate-300 sm:text-[17px]">
                I don't just write code — I build complete solutions. Here's how I can help your business grow with technology that actually works.
              </p>
            </div>

            {/* Service Cards Grid */}
            <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {[
                {
                  icon: '🚀',
                  title: 'Full-Stack Web Apps',
                  desc: 'Complete web applications with modern frameworks. From user-facing frontends to robust backends — everything your product needs to launch.',
                  examples: ['SaaS Platforms', 'E-Commerce', 'Social Platforms'],
                },
                {
                  icon: '⚙️',
                  title: 'Backend & API Systems',
                  desc: 'Secure, scalable server-side architectures with REST APIs, authentication, payment integration, and database design.',
                  examples: ['REST APIs', 'Payment Gateways', 'Auth Systems'],
                },
                {
                  icon: '📊',
                  title: 'Dashboards & Admin Panels',
                  desc: 'Custom dashboards to manage users, data, and analytics. Real-time updates, role-based access, and clean data visualization.',
                  examples: ['Analytics Dashboards', 'CMS Panels', 'User Management'],
                },
                {
                  icon: '📱',
                  title: 'Responsive Web Design',
                  desc: 'Beautiful, pixel-perfect interfaces that work flawlessly across all devices. Mobile-first design with smooth animations.',
                  examples: ['Landing Pages', 'Portfolio Sites', 'Marketing Pages'],
                },
                {
                  icon: '🏥',
                  title: 'Health-Tech & Tracking',
                  desc: 'Specialized in health and tracking systems — vaccination engines, growth monitoring, appointment scheduling, and medical records.',
                  examples: ['Patient Portals', 'Health Trackers', 'Scheduling'],
                },
                {
                  icon: '🔧',
                  title: 'Bug Fixes & Optimization',
                  desc: 'Existing app broken or slow? I debug, refactor, and optimize your codebase for better performance and maintainability.',
                  examples: ['Performance Tuning', 'Code Refactoring', 'Bug Fixing'],
                },
              ].map((service) => (
                <div
                  key={service.title}
                  className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.06] sm:p-7"
                >
                  <div className="mb-4 text-3xl">{service.icon}</div>
                  <h3 className="mb-3 text-[18px] font-bold text-white sm:text-[20px]">{service.title}</h3>
                  <p className="mb-4 text-[14px] leading-[1.7] text-slate-400 sm:text-[15px]">{service.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {service.examples.map((ex) => (
                      <span key={ex} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA below services */}
            <div className="mx-auto mt-10 max-w-2xl text-center">
              <p className="mb-4 text-[15px] text-slate-400">Not sure what you need? Let's talk — I'll help you figure it out.</p>
              <button
                onClick={() => {
                  const el = document.getElementById('contact')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:border-violet-400/60 hover:bg-violet-500/20 hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
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
