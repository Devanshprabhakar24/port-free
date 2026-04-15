import { memo } from 'react'
import { motion } from 'framer-motion'

export default function Trust({ mouse }: { mouse: any }) {
  void mouse

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0a0a12]/90 to-black">
      {/* Subtle background elements */}
      <div className="pointer-events-none absolute inset-0" 
           style={{
             backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(124,58,237,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 50%)'
           }} />
      
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center md:px-8 lg:py-32">
        <div className="mb-12 max-w-3xl">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-violet-500 to-pink-500" />
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet-400">Why Clients Choose Me</p>
            <div className="h-px w-12 bg-gradient-to-r from-violet-500 to-pink-500" />
          </div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(32px,5vw,56px)] font-black leading-[1.1] tracking-[-0.02em] text-white bg-gradient-to-r from-white via-violet-100 to-pink-100 bg-clip-text bg-[length:200%_200%] animate-gradient-bg"
          >
            The Developer Startups Rely On
          </motion.h2>
          
          <p className="mx-auto mt-6 max-w-xl text-xl leading-[1.75] text-slate-300">
            I don't just deliver code. I build systems that power real businesses, handle growth, and generate revenue.
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-2">
          {[
            {
              icon: '💬',
              title: 'Lightning Communication',
              desc: '24h response time. Clear updates. No ghosting. You always know exactly where your project stands.'
            },
            {
              icon: '🔒',
              title: 'Production-Ready Code',
              desc: 'Clean, scalable architecture that handles real traffic. 100% uptime on all 5 live projects.'
            },
            {
              icon: '⚡',
              title: 'Fast Delivery',
              desc: 'Most projects delivered in 7-14 days. No endless delays. Your product launches on schedule.'
            },
            {
              icon: '📈',
              title: 'Business Results',
              desc: 'Apps that actually grow revenue — 50K+ users served. Systems built to scale with your success.'
            }
          ].map((trustPoint, index) => (
            <motion.div
              key={trustPoint.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col items-center gap-4 rounded-3xl bg-white/5 p-8 backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-2xl border border-white/10"
            >
              <div className="text-4xl transition-transform group-hover:scale-110">{trustPoint.icon}</div>
              <h3 className="text-xl font-bold text-white">{trustPoint.title}</h3>
              <p className="text-center text-slate-300 leading-relaxed">{trustPoint.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <button
            onClick={() => {
              const el = document.getElementById('contact')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 px-10 py-6 text-lg font-bold text-white shadow-2xl hover:shadow-[0_20px_50px_rgba(124,58,237,0.4)] transition-all duration-300 hover:scale-105"
          >
            Start Your Project Today
            <span className="transition-transform group-hover:translate-x-2">→</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

