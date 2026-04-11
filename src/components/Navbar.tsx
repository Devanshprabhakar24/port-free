import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type SectionId = 'hero' | 'about' | 'projects' | 'contact'

const links: Array<{ id: SectionId; label: string }> = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

type NavbarProps = {
  activeSection: SectionId
  onNavigate: (section: SectionId) => void
}

export default function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-40 w-full transition ${
          scrolled ? 'glass-panel border-b border-white/10' : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <button
            onClick={() => onNavigate('hero')}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-sm tracking-[0.25em] text-white"
          >
            DEVANSH PRABHAKAR
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group relative text-sm font-medium text-white/80 transition hover:text-white"
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all ${
                    activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}

            <button
              onClick={() => onNavigate('contact')}
              className="relative rounded-full border border-fuchsia-300/60 bg-fuchsia-400/10 px-5 py-2 text-sm font-semibold text-white"
            >
              <span className="absolute inset-0 animate-pulse rounded-full border border-fuchsia-300/40" />
              <span className="relative">Hire Me</span>
            </button>
          </div>

          <button
            className="grid h-10 w-10 place-items-center text-white md:hidden"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Toggle mobile menu"
          >
            <span className="h-[2px] w-6 bg-white" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[#07070d]/95 md:hidden"
          >
            <div className="flex flex-col items-center gap-8">
              {links.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileOpen(false)
                  }}
                  className="text-2xl font-semibold text-white"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  )
}
