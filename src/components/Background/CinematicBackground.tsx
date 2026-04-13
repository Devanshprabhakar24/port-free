/**
 * CinematicBackground — fully responsive edition
 * ─────────────────────────────────────────────────────────────────────────────
 * What changed for responsiveness:
 *
 *  1. PLANETS stores RELATIVE values (x/y as 0-1 fractions, size as fraction
 *     of Math.min(vw,vh)) instead of hardcoded px / % strings.
 *
 *  2. A `viewport` ref is updated every rAF tick (cheap: just read
 *     window.innerWidth/innerHeight). Planet position + size are derived
 *     from it inside the rAF loop, so resize is picked up automatically
 *     with ZERO event listeners for layout.
 *
 *  3. `applyPlanet()` now receives computed px values (cx, cy, radius)
 *     and writes `left`, `top`, `width`, `height`, `marginLeft`, `marginTop`
 *     directly every frame — same DOM-mutation pattern as transform/opacity.
 *     This is the key: position is NOT baked into initial React style.
 *
 *  4. Tablet breakpoint (768-1199px): planets shift to centre-right, slightly
 *     smaller. Mobile (<768px): lightweight canvas-free fallback with a
 *     single CSS gradient planet, no rAF.
 *
 *  5. Pointer parallax amplitude scales with viewport width so it feels
 *     proportional on wide monitors and subtle on narrow ones.
 *
 * Everything else (depth curves, crossfade, z-sort, star parallax, velocity
 * streak, ambient orbiters) is unchanged from the previous version.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { memo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { getDeviceCapabilities } from '../../utils/deviceCapabilities'
import type { SectionId } from '../../store/scrollSectionStore'
import DepthIndicator from '../PlanetSystem/DepthIndicator'

// Detect device capabilities for adaptive rendering
const deviceCaps = getDeviceCapabilities()
const isLowEndDevice = deviceCaps.isLowEnd

// ─── Types ────────────────────────────────────────────────────────────────────

type StarDef = { left: string; top: string; size: number; opacity: number; blue: boolean }

/**
 * xFrac / yFrac  — planet centre as fraction of viewport (0-1).
 * sizeFrac       — planet diameter as fraction of Math.min(vw, vh).
 *
 * These are the layout "intent". Actual px values are computed each rAF
 * tick so the planet repositions instantly on any viewport change.
 */
type PlanetConfig = {
  id: SectionId
  color: string
  glow: string
  /** diameter = sizeFrac × Math.min(vw, vh)  */
  sizeFrac: number
  /** centre X = xFrac × vw */
  xFrac: number
  /** centre Y = yFrac × vh */
  yFrac: number
  ring?: boolean
  tilt?: number
  label: string
  accentColor: string
  /**
   * Per-breakpoint overrides so the planet repositions on tablet.
   * Applied when vw < tabletBreak (default 1200).
   */
  tablet?: { xFrac?: number; yFrac?: number; sizeFrac?: number }
}

type OrbiterConfig = {
  id: string; color: string; glow: string
  /** diameter = sizeFrac × Math.min(vw, vh) */
  sizeFrac: number
  xFrac: number; yFrac: number; baseDepth: number
  floatAmpX: number; floatAmpY: number; floatDuration: number; floatDelay: number
}

// ─── Star field ───────────────────────────────────────────────────────────────

function makeStars(n: number, minSz: number, maxSz: number, minOp: number, maxOp: number): StarDef[] {
  return Array.from({ length: n }, (_, i) => ({
    left:    `${(i * 37 + 11) % 100}%`,
    top:     `${(i * 53 + 17) % 100}%`,
    size:    minSz + ((i * 29 + 7) % 100) / 100 * (maxSz - minSz),
    opacity: minOp + ((i * 19 + 5) % 100) / 100 * (maxOp - minOp),
    blue:    i % 7 === 0,
  }))
}

const FAR_STARS  = makeStars(80, 0.4, 0.9,  0.28, 0.50)
const MID_STARS  = makeStars(48, 0.9, 1.4,  0.38, 0.65)
const NEAR_STARS = makeStars(24, 1.3, 2.0,  0.58, 0.85)

// ─── Planet configs (all values relative, NO hardcoded px) ───────────────────

const TABLET_BREAK = 1200  // px — below this, tablet overrides apply

const PLANETS: PlanetConfig[] = [
  {
    id: 'hero',
    color: '#2d0a52', glow: 'rgba(124,58,237,0.55)',
    sizeFrac: 0.62, xFrac: 0.74, yFrac: 0.20,
    ring: false, label: 'HOME', accentColor: 'rgba(167,139,250,0.5)',
    tablet: { xFrac: 0.70, yFrac: 0.18, sizeFrac: 0.54 },
  },
  {
    id: 'about',
    color: '#0a1d52', glow: 'rgba(37,99,235,0.55)',
    sizeFrac: 0.54, xFrac: 0.72, yFrac: 0.22,
    ring: true, tilt: -18, label: 'ABOUT', accentColor: 'rgba(96,165,250,0.45)',
    tablet: { xFrac: 0.68, yFrac: 0.20, sizeFrac: 0.46 },
  },
  {
    id: 'projects',
    color: '#52091e', glow: 'rgba(236,72,153,0.55)',
    sizeFrac: 0.56, xFrac: 0.72, yFrac: 0.21,
    ring: false, label: 'PROJECTS', accentColor: 'rgba(244,114,182,0.45)',
    tablet: { xFrac: 0.68, yFrac: 0.19, sizeFrac: 0.48 },
  },
  {
    id: 'contact',
    color: '#52100a', glow: 'rgba(239,68,68,0.55)',
    sizeFrac: 0.50, xFrac: 0.71, yFrac: 0.21,
    ring: false, label: 'CONTACT', accentColor: 'rgba(252,165,165,0.4)',
    tablet: { xFrac: 0.67, yFrac: 0.19, sizeFrac: 0.42 },
  },
]

// ─── Ambient orbiters (relative coords) ──────────────────────────────────────

const ORBITERS: OrbiterConfig[] = [
  { id:'orb-a', color:'#061428', glow:'rgba(56,189,248,0.28)',  sizeFrac:0.18, xFrac:0.16, yFrac:0.58, baseDepth:0.22, floatAmpX:9,  floatAmpY:13, floatDuration:22, floatDelay:0  },
  { id:'orb-b', color:'#150820', glow:'rgba(168,85,247,0.22)',  sizeFrac:0.12, xFrac:0.88, yFrac:0.70, baseDepth:0.18, floatAmpX:7,  floatAmpY:10, floatDuration:28, floatDelay:4  },
  { id:'orb-c', color:'#061810', glow:'rgba(52,211,153,0.20)',  sizeFrac:0.09, xFrac:0.07, yFrac:0.24, baseDepth:0.15, floatAmpX:5,  floatAmpY:7,  floatDuration:19, floatDelay:8  },
  { id:'orb-d', color:'#1a0606', glow:'rgba(251,113,133,0.18)', sizeFrac:0.15, xFrac:0.60, yFrac:0.88, baseDepth:0.20, floatAmpX:11, floatAmpY:7,  floatDuration:32, floatDelay:12 },
]

// ─── Helpers: compute responsive px values from viewport ─────────────────────

function resolvedPlanet(cfg: PlanetConfig, vw: number, vh: number) {
  const isTablet = vw < TABLET_BREAK
  const xFrac    = (isTablet && cfg.tablet?.xFrac    != null) ? cfg.tablet.xFrac    : cfg.xFrac
  const yFrac    = (isTablet && cfg.tablet?.yFrac    != null) ? cfg.tablet.yFrac    : cfg.yFrac
  const sizeFrac = (isTablet && cfg.tablet?.sizeFrac != null) ? cfg.tablet.sizeFrac : cfg.sizeFrac
  const size     = sizeFrac * Math.min(vw, vh)
  return { cx: xFrac * vw, cy: yFrac * vh, size }
}

function resolvedOrbiter(cfg: OrbiterConfig, vw: number, vh: number) {
  return {
    cx:   cfg.xFrac * vw,
    cy:   cfg.yFrac * vh,
    size: cfg.sizeFrac * Math.min(vw, vh),
  }
}

// ─── Depth → visual curves ────────────────────────────────────────────────────

const depthToScale   = (d: number) => 0.22 + Math.pow(d, 0.65) * 0.78
const depthToOpacity = (d: number) => 0.05 + Math.pow(d, 0.42) * 0.95
const depthToBlur    = (d: number) => (1 - Math.pow(d, 0.65)) * 24
const depthToGlowM   = (d: number) => Math.pow(d, 1.4)
const depthToZ       = (d: number) => Math.pow(d, 1.2) * 280

const FADE_START = 0.86

// ─── applyPlanet: mutates ALL layout + visual props every rAF tick ────────────
// Position (left/top/width/height) is set here — NOT baked into JSX — so
// viewport resize is picked up automatically without any resize listener.

function applyPlanet(
  el: HTMLDivElement,
  cfg: PlanetConfig,
  depth: number,
  isFocused: boolean,
  px: number,   // lerped pointer -0.5…0.5
  py: number,
  vw: number,
  vh: number,
): void {
  const d   = Math.max(0, Math.min(1, depth))
  const gm  = depthToGlowM(d)
  const sc  = depthToScale(d)
  let   op  = depthToOpacity(d)
  const bl  = depthToBlur(d)
  const zTx = depthToZ(d)

  // Crossfade: ghost focused planet out past threshold
  if (isFocused && d > FADE_START) {
    const t = (d - FADE_START) / (1 - FADE_START)
    op *= (1 - t * t * 0.72)
  }

  // Pointer parallax — amplitude scales with viewport so it feels right at any size
  const pxAmp = Math.min(vw, 1440) / 1440 * 14
  const pyAmp = Math.min(vh, 900)  / 900  * 10
  const dpx   = isFocused ? px * pxAmp : px * pxAmp * 0.18
  const dpy   = isFocused ? py * pyAmp : py * pyAmp * 0.14

  // Responsive layout values computed from current viewport
  const { cx, cy, size } = resolvedPlanet(cfg, vw, vh)

  // Write position + size (responsive — updates on every tick, free resize)
  el.style.left      = `${cx.toFixed(2)}px`
  el.style.top       = `${cy.toFixed(2)}px`
  el.style.width     = `${size.toFixed(2)}px`
  el.style.height    = `${size.toFixed(2)}px`
  el.style.marginLeft = `${(-size / 2).toFixed(2)}px`
  el.style.marginTop  = `${(-size / 2).toFixed(2)}px`

  // Write visual props
  el.style.transform = `translate3d(${dpx.toFixed(2)}px,${dpy.toFixed(2)}px,${zTx.toFixed(2)}px) scale(${sc.toFixed(4)})`
  el.style.opacity   = op.toFixed(4)
  el.style.filter    = bl > 0.4
    ? `blur(${bl.toFixed(2)}px) brightness(${(0.38 + d * 0.62).toFixed(3)}) saturate(${(0.42 + d * 0.65).toFixed(3)})`
    : `brightness(${(0.38 + d * 0.62).toFixed(3)}) saturate(${(0.42 + d * 0.65).toFixed(3)})`

  const g1 = Math.round(size * 0.05 * gm)
  const g2 = Math.round(size * 0.18 * gm)
  const g3 = Math.round(size * 0.62 * gm)
  el.style.boxShadow = `0 0 ${g1}px ${cfg.glow},0 0 ${g2}px ${cfg.glow},0 0 ${g3}px ${cfg.glow},inset -30px -22px 52px rgba(0,0,0,0.52),inset 20px 14px 40px rgba(255,255,255,0.10)`

  // Update ring (needs current size)
  const ring = el.querySelector<HTMLElement>('[data-planet-ring]')
  if (ring) {
    ring.style.width      = `${(size * 1.42).toFixed(2)}px`
    ring.style.height     = `${(size * 0.38).toFixed(2)}px`
    ring.style.marginLeft = `${(-(size * 1.42) / 2).toFixed(2)}px`
    ring.style.marginTop  = `${(-(size * 0.38) / 2).toFixed(2)}px`
    ring.style.opacity    = depth.toFixed(3)
    ring.style.filter     = `blur(${((1 - depth) * 3).toFixed(1)}px)`
  }

  // Update label (bottom offset + font size depend on size)
  const lbl = el.querySelector<HTMLElement>('[data-planet-label]')
  if (lbl) {
    lbl.style.bottom   = `${-Math.max(12, size * 0.065)}px`
    lbl.style.fontSize = `${Math.max(9, size * 0.027)}px`
    lbl.style.opacity  = (depth > 0.70 && isFocused) ? ((depth - 0.70) / 0.30).toFixed(3) : '0'
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function CinematicBackground() {
  const isMobile      = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()

  const farRef     = useRef<HTMLDivElement>(null)
  const midRef     = useRef<HTMLDivElement>(null)
  const nearRef    = useRef<HTMLDivElement>(null)
  const streakRef  = useRef<HTMLDivElement>(null)
  const vigRef     = useRef<HTMLDivElement>(null)
  const planetRefs = useRef<(HTMLDivElement | null)[]>(PLANETS.map(() => null))

  const pointer  = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const streakTO = useRef<number | null>(null)

  // Velocity streak
  useEffect(() => {
    return useScrollSectionStore.subscribe(
      (s) => s.velocityBand,
      (band) => {
        const st = streakRef.current; const vg = vigRef.current
        if (!st || !vg) return
        if (band === 'fast') {
          st.style.transform = 'scaleY(2.8)'; st.style.filter = 'blur(1.5px)'; st.style.opacity = '0.9'
          vg.style.opacity = '1'
          if (streakTO.current) clearTimeout(streakTO.current)
        } else {
          streakTO.current = window.setTimeout(() => {
            if (st) { st.style.transform = 'scaleY(1)'; st.style.filter = 'none'; st.style.opacity = '1' }
            if (vg)  vg.style.opacity = '0'
          }, 380)
        }
      },
    )
  }, [])

  // Pointer tracking (desktop only)
  useEffect(() => {
    if (isMobile) return
    const onMove = (e: PointerEvent) => {
      pointer.current.tx = e.clientX / window.innerWidth  - 0.5
      pointer.current.ty = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [isMobile])

  // ── Master rAF loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || isMobile) return
    let rafId: number | null = null

    const tick = () => {
      rafId = requestAnimationFrame(tick)

      // Read viewport once per tick — free resize handling, no ResizeObserver needed
      const vw = window.innerWidth
      const vh = window.innerHeight

      // 1. Lerp pointer
      const p = pointer.current
      p.x += (p.tx - p.x) * 0.072
      p.y += (p.ty - p.y) * 0.072

      // 2. Star parallax
      const maxSc = Math.max(1, document.documentElement.scrollHeight - vh)
      const sp = window.scrollY / maxSc
      if (farRef.current)  farRef.current.style.transform  = `translateY(${(sp * -90).toFixed(2)}px)`
      if (midRef.current)  midRef.current.style.transform  = `translateY(${(sp * -200).toFixed(2)}px)`
      if (nearRef.current) nearRef.current.style.transform = `translateY(${(sp * -360).toFixed(2)}px)`

      // 3. Depth map
      const rawDepths: Record<string, number> = {}
      PLANETS.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (!el) { rawDepths[id] = 0; return }
        const r = el.getBoundingClientRect()
        const dist = Math.abs((r.top + r.height / 2) - vh / 2)
        rawDepths[id] = Math.max(0, 1 - dist / (vh * 0.8))
      })

      // 4. Focused planet
      let focusedId: SectionId = PLANETS[0].id
      PLANETS.forEach(({ id }) => { if (rawDepths[id] > rawDepths[focusedId]) focusedId = id })

      // 5. Z-sort + apply
      const sorted = [...PLANETS].sort((a, b) => rawDepths[a.id] - rawDepths[b.id])
      sorted.forEach((cfg, si) => {
        const el = planetRefs.current[PLANETS.indexOf(cfg)]
        if (!el) return
        el.style.zIndex = String(si * 10 + (cfg.id === focusedId ? 50 : 0))
        applyPlanet(el, cfg, rawDepths[cfg.id], cfg.id === focusedId, p.x, p.y, vw, vh)
      })
    }

    rafId = requestAnimationFrame(tick)
    return () => { if (rafId !== null) cancelAnimationFrame(rafId) }
  }, [reducedMotion, isMobile])

  // ── Reduced-motion static fallback ────────────────────────────────────────
  if (reducedMotion) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#03010a]">
        <NebulaBase />
        <div className="absolute rounded-full" style={{
          left:'74%', top:'20%', width:'min(580px,62vmin)', height:'min(580px,62vmin)',
          transform:'translate(-50%,-50%)',
          background:'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.20) 0%, transparent 30%), radial-gradient(circle at 50% 50%, #2d0a52 0%, rgba(16,12,36,0.92) 70%, rgba(3,1,10,0.98) 100%)',
        }} />
      </div>
    )
  }

  // ── Mobile fallback ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#03010a]">
        <NebulaBase />
        
        {/* Animated gradient overlay - simplified for mobile */}
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 70% 20%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(37,99,235,0.10) 0%, transparent 40%)',
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Main planet - responsive sizing */}
        <motion.div 
          className="absolute rounded-full"
          style={{
            right: isLowEndDevice ? '8%' : '5%',
            top: isLowEndDevice ? '15%' : '12%',
            width: isLowEndDevice ? 'min(200px, 45vw)' : 'min(260px, 55vw)',
            height: isLowEndDevice ? 'min(200px, 45vw)' : 'min(260px, 55vw)',
            background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.18), rgba(124,58,237,0.42) 45%, rgba(16,12,36,0.2) 80%)',
            filter: isLowEndDevice ? 'blur(0.5px)' : 'blur(1px)',
            boxShadow: '0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.15)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Small ambient accent - only on mid-range+ devices */}
        {!isLowEndDevice && (
          <motion.div 
            className="absolute rounded-full"
            style={{
              left: '8%',
              bottom: '22%',
              width: 'min(90px, 20vw)',
              height: 'min(90px, 20vw)',
              background: 'radial-gradient(circle at 40% 40%, rgba(37,99,235,0.40), rgba(16,12,36,0.0) 80%)',
              filter: 'blur(4px)',
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        )}
        
        {/* Simplified star field for mobile */}
        <div className="absolute inset-0">
          {!isLowEndDevice && Array.from({ length: 20 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${(i * 37 + 11) % 100}%`,
                top: `${(i * 53 + 17) % 100}%`,
                width: i % 3 === 0 ? '2px' : '1px',
                height: i % 3 === 0 ? '2px' : '1px',
                opacity: 0.3 + (i % 5) * 0.1,
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#03010a]"
      style={{ perspective:'1500px', perspectiveOrigin:'50% 38%', transformStyle:'preserve-3d' }}
    >
      <NebulaBase />

      {/* Animated nebula clouds */}
      <NebCloud className="absolute -left-[50px] -top-[70px] h-[340px] w-[460px]"
        bg="radial-gradient(ellipse at 40% 40%, rgba(88,28,135,0.22) 0%, transparent 72%)"
        anim={{ opacity:[0.65,1,0.68], scale:[1,1.06,1] }} dur={13} />
      <NebCloud className="absolute bottom-[-50px] right-[28%] h-[300px] w-[380px]"
        bg="radial-gradient(ellipse at 50% 50%, rgba(30,58,138,0.18) 0%, transparent 72%)"
        anim={{ opacity:[0.50,0.90,0.55], scale:[1,1.05,1] }} dur={16} delay={3} />
      <NebCloud className="absolute right-[-60px] top-[35%] h-[260px] w-[320px]"
        bg="radial-gradient(ellipse at 55% 45%, rgba(157,23,77,0.14) 0%, transparent 70%)"
        anim={{ opacity:[0.40,0.75,0.42], scale:[1,1.04,1] }} dur={19} delay={7} />
      <NebCloud className="absolute left-[30%] top-[-80px] h-[220px] w-[340px]"
        bg="radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)"
        anim={{ opacity:[0.35,0.65,0.38], scale:[1,1.03,1] }} dur={22} delay={11} />

      {/* Accent stars */}
      <motion.div className="absolute right-[12%] top-[22%] h-3 w-3 rounded-full bg-white/80"
        animate={{ scale:[1,1.6,1], opacity:[0.60,1,0.62] }}
        transition={{ duration:5.5, repeat:Infinity, ease:'easeInOut' }}
        style={{ boxShadow:'0 0 28px rgba(255,255,255,0.65), 0 0 8px rgba(200,210,255,0.9)' }} />
      <motion.div className="absolute left-[22%] top-[68%] h-2 w-2 rounded-full bg-white/60"
        animate={{ scale:[1,1.4,1], opacity:[0.40,0.90,0.42] }}
        transition={{ duration:7.2, repeat:Infinity, ease:'easeInOut', delay:2.1 }}
        style={{ boxShadow:'0 0 18px rgba(167,139,250,0.7)' }} />
      <motion.div className="absolute left-[58%] top-[44%] h-1.5 w-1.5 rounded-full bg-white/50"
        animate={{ scale:[1,1.3,1], opacity:[0.30,0.70,0.32] }}
        transition={{ duration:9.1, repeat:Infinity, ease:'easeInOut', delay:4.5 }}
        style={{ boxShadow:'0 0 12px rgba(96,165,250,0.6)' }} />

      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage:'linear-gradient(rgba(124,58,237,0.032) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.032) 1px,transparent 1px)',
        backgroundSize:'48px 48px',
      }} />

      {/* Horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[28vh]"
        style={{ background:'linear-gradient(to top, rgba(124,58,237,0.08) 0%, transparent 100%)' }} />

      {/* Star layers */}
      <div ref={farRef} className="absolute will-change-transform" style={{ inset:0, height:'132%', top:'-16%' }}>
        {FAR_STARS.map((s,i) => (
          <span key={i} className="absolute rounded-full" style={{ left:s.left, top:s.top, width:s.size, height:s.size, backgroundColor:s.blue?'rgba(200,212,255,0.88)':'rgba(255,255,255,0.92)', opacity:s.opacity }} />
        ))}
      </div>
      <div ref={midRef} className="absolute will-change-transform" style={{ inset:0, height:'148%', top:'-24%' }}>
        {MID_STARS.map((s,i) => (
          <span key={i} className="absolute rounded-full" style={{ left:s.left, top:s.top, width:s.size, height:s.size, backgroundColor:s.blue?'rgba(180,202,255,0.88)':'rgba(255,255,255,0.92)', opacity:s.opacity }} />
        ))}
      </div>
      <div ref={nearRef} className="absolute will-change-transform" style={{ inset:0, height:'168%', top:'-34%' }}>
        <div ref={streakRef} style={{ position:'absolute', inset:0, transformOrigin:'50% 50%', transform:'scaleY(1)', transition:'transform 0.38s ease-out, filter 0.38s ease-out, opacity 0.38s ease-out' }}>
          {NEAR_STARS.map((s,i) => (
            <span key={i} className="absolute rounded-full bg-white" style={{ left:s.left, top:s.top, width:s.size, height:s.size, opacity:s.opacity }} />
          ))}
        </div>
      </div>

      {/* Velocity vignette */}
      <div ref={vigRef} className="absolute inset-0" style={{ opacity:0, transition:'opacity 0.38s ease-out', background:'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 28%, rgba(0,0,0,0.35) 100%)' }} />

      {/* Ambient orbiters */}
      {ORBITERS.map(orb => <OrbiterPlanet key={orb.id} config={orb} />)}

      {/* Section planets — position + size + visuals all set by rAF */}
      {PLANETS.map((cfg, idx) => (
        <PlanetElement
          key={cfg.id}
          config={cfg}
          ref={(el) => { planetRefs.current[idx] = el }}
        />
      ))}

      <DepthIndicator />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NebulaBase() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.13),transparent_36%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.09),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.09),transparent_25%)]" />
  )
}

const NebCloud = memo(function NebCloud({
  className, bg, anim, dur, delay = 0,
}: { className:string; bg:string; anim:{opacity:number[];scale:number[]}; dur:number; delay?:number }) {
  return (
    <motion.div
      className={`${className} rounded-full will-change-transform`}
      style={{ background: bg }}
      animate={anim}
      transition={{ duration:dur, repeat:Infinity, ease:'easeInOut', delay }}
    />
  )
})

/**
 * OrbiterPlanet — ambient background floaters.
 * Position + size are also computed responsively, but orbiters use motion.div
 * (Framer handles the float animation), so we use CSS custom properties to
 * update layout. We read vw/vh at mount and on resize via a lightweight hook.
 */
const OrbiterPlanet = memo(function OrbiterPlanet({ config: o }: { config: OrbiterConfig }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef     = useRef<HTMLDivElement>(null)

  // Update position + size on resize
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth; const vh = window.innerHeight
      const { cx, cy, size } = resolvedOrbiter(o, vw, vh)
      const el = containerRef.current; const inner = innerRef.current
      if (!el || !inner) return
      el.style.left = `${cx}px`; el.style.top = `${cy}px`
      inner.style.width = `${size}px`; inner.style.height = `${size}px`
      inner.style.marginLeft = `${-size/2}px`; inner.style.marginTop = `${-size/2}px`
    }
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [o])

  const d  = o.baseDepth
  const gm = depthToGlowM(d)
  // Use a representative size for initial box-shadow (will update on resize rarely matters for orbiters)
  const refSize = o.sizeFrac * Math.min(typeof window !== 'undefined' ? window.innerWidth : 1440, typeof window !== 'undefined' ? window.innerHeight : 900)
  const g1 = Math.round(refSize * 0.05 * gm); const g2 = Math.round(refSize * 0.18 * gm); const g3 = Math.round(refSize * 0.55 * gm)

  return (
    <motion.div
      ref={containerRef}
      className="absolute"
      style={{ zIndex: Math.round(d * 40) }}
      animate={{ x:[0,o.floatAmpX,0,-o.floatAmpX,0], y:[0,-o.floatAmpY,0,o.floatAmpY,0] }}
      transition={{ duration:o.floatDuration, repeat:Infinity, ease:'easeInOut', delay:o.floatDelay }}
    >
      <div
        ref={innerRef}
        className="rounded-full"
        style={{
          transform:`scale(${depthToScale(d).toFixed(3)})`,
          opacity: depthToOpacity(d),
          filter:`blur(${depthToBlur(d).toFixed(1)}px) brightness(0.5) saturate(0.55)`,
          background:`radial-gradient(circle at 30% 28%, rgba(255,255,255,0.14) 0%, transparent 30%), radial-gradient(circle at 50% 50%, ${o.color} 0%, rgba(16,12,36,0.92) 70%, rgba(3,1,10,0.98) 100%)`,
          boxShadow:`0 0 ${g1}px ${o.glow},0 0 ${g2}px ${o.glow},0 0 ${g3}px ${o.glow},inset -20px -14px 36px rgba(0,0,0,0.50)`,
        }}
      />
    </motion.div>
  )
})

/**
 * PlanetElement — shell rendered once by React.
 * ALL layout + visual props are mutated by applyPlanet() inside the rAF loop.
 * Initial style is deliberately empty / invisible — rAF takes over on tick 1.
 */
const PlanetElement = memo(
  React.forwardRef<HTMLDivElement, { config: PlanetConfig }>(
    function PlanetElement({ config: cfg }, ref) {
      return (
        <div
          ref={ref}
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            // Deliberately left=0,top=0,w=0,h=0 — rAF sets real values tick 1
            opacity: 0,
            transform: 'translate3d(0,0,0) scale(0.22)',
            transition: 'none',   // CRITICAL — no CSS must fight the rAF driver
            willChange: 'transform, opacity, filter',
            background: [
              'radial-gradient(circle at 30% 28%, rgba(255,255,255,0.24) 0%, transparent 34%)',
              'radial-gradient(circle at 68% 72%, rgba(255,255,255,0.10) 0%, transparent 28%)',
              `radial-gradient(circle at 50% 50%, ${cfg.color} 0%, rgba(16,12,36,0.92) 68%, rgba(3,1,10,0.98) 100%)`,
            ].join(','),
          }}
        >
          {/* Specular */}
          <div className="absolute inset-0 rounded-full" style={{ background:'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.26) 0%, transparent 30%)', opacity:0.9 }} />
          {/* Atmospheric rim */}
          <div className="absolute inset-0 rounded-full" style={{ background:`radial-gradient(circle at 50% 50%, transparent 54%, ${cfg.accentColor} 78%, transparent 100%)`, opacity:0.55 }} />
          {/* Corona */}
          <div className="absolute inset-0 rounded-full" style={{ background:`radial-gradient(circle at 50% 50%, transparent 58%, ${cfg.glow} 86%, transparent 100%)`, opacity:0.30 }} />
          {/* Ring — width/height/margin written by rAF */}
          {cfg.ring && (
            <div
              data-planet-ring=""
              className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
              style={{
                border: `1.5px solid ${cfg.accentColor}`,
                boxShadow: `0 0 28px ${cfg.glow}, inset 0 0 14px ${cfg.glow}`,
                transform: `rotate(${cfg.tilt ?? -12}deg)`,
                opacity: 0, transition: 'none',
              }}
            />
          )}
          {/* Label — bottom + fontSize written by rAF */}
          {cfg.label && (
            <div
              data-planet-label=""
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono uppercase tracking-[0.30em] text-white/40"
              style={{ whiteSpace:'nowrap', opacity:0, transition:'none' }}
            >
              {cfg.label}
            </div>
          )}
        </div>
      )
    }
  )
)

export default memo(CinematicBackground)
