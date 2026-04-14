import { memo } from 'react'

function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/10 bg-[#0a0a12]/80 backdrop-blur-xl px-6 py-8 text-center font-mono text-[11px] tracking-[0.14em] text-slate-400">
      <p>BUILT BY DEVANSH PRABHAKAR. HELPING FOUNDERS SCALE WITH CODE.</p>
      <p className="mt-2 text-slate-500">INDIA · AVAILABLE WORLDWIDE</p>
    </footer>
  )
}

export default memo(Footer)
