
import { motion } from 'framer-motion'

export default function CTA({ mouse }: { mouse: any }) {
  void mouse

  return (
    <div className="relative min-h-[70vh] w-full bg-gradient-to-b from-[#0a0a12] to-black py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_-5%,rgba(124,58,237,0.15),transparent_50%)]" />
      
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-6 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-6 bg-gradient-to-r from-white via-violet-100 to-pink-100 bg-clip-text text-[clamp(36px,6vw,64px)] font-black leading-tight text-transparent">
            Have a project in mind?
          </h2>
          
          <p className="mx-auto mb-12 max-w-2xl text-xl leading-[1.6] text-slate-300">
            I'll help you turn your business idea into a real product — fast, reliable, and built to make money.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const el = document.getElementById('contact')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group rounded-full bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 px-12 py-6 text-xl font-bold text-white shadow-[0_15px_40px_rgba(124,58,237,0.4)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(124,58,237,0.5)] hover:scale-[1.02]"
            >
              Start Your Project
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-2">→</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const el = document.getElementById('projects')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group rounded-full border-2 border-white/20 bg-white/10 px-12 py-6 text-xl font-bold text-white backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/20 hover:shadow-xl"
            >
              See My Work
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

