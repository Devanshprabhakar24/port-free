import { memo } from 'react'

function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/10 px-6 py-6 text-center font-mono text-[10px] tracking-[0.12em] text-[#334155]">
      <p>BUILT WITH REACT + THREE.JS · DEVANSH PRABHAKAR · 2026</p>
      <p className="mt-2">INDIA · AVAILABLE WORLDWIDE</p>
    </footer>
  )
}

export default memo(Footer)
