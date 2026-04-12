import { memo, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useScrollSectionStore } from '../../store/scrollSectionStore'
import type { SectionId } from '../../store/scrollSectionStore'
import { scrollStore, initScrollStore } from '../../hooks/scrollStore'
import vertSrc from '../../shaders/planet.vert.glsl?raw'
import fragSrc from '../../shaders/planet.frag.glsl?raw'

const SECTION_IDS: SectionId[] = ['hero', 'about', 'projects', 'contact']
const PLANET_COUNT = 6

// ── Planet config ───────────────────────────────────────────────────────────
interface PlanetDef {
  name: string; color: string; baseSize: number
  earth?: boolean
  side: 'left' | 'right'
  yBias: number
  tiltBase: number
  texture: string
  atmoColor: [number, number, number]
  atmoThickness: number
}

const PLANETS: PlanetDef[] = [
  {
    name: 'Earth', color: '#2a7fc7', baseSize: 460, earth: true, side: 'left', yBias: -0.08, tiltBase: 0.41,
    texture: '/textures/earth.jpg', atmoColor: [0.22, 0.52, 1.00], atmoThickness: 1.0
  },
  {
    name: 'Mars', color: '#c1440e', baseSize: 400, side: 'right', yBias: 0.12, tiltBase: 0.44,
    texture: '/textures/mars.jpg', atmoColor: [0.82, 0.42, 0.18], atmoThickness: 0.25
  },
  {
    name: 'Jupiter', color: '#c88b3a', baseSize: 540, side: 'left', yBias: -0.15, tiltBase: 0.05,
    texture: '/textures/jupiter.jpg', atmoColor: [0.58, 0.65, 0.88], atmoThickness: 0.7
  },
  {
    name: 'Saturn', color: '#d4b86a', baseSize: 480, side: 'right', yBias: 0.06, tiltBase: 0.47,
    texture: '/textures/saturn.jpg', atmoColor: [0.78, 0.72, 0.55], atmoThickness: 0.5
  },
  {
    name: 'Uranus', color: '#7de8e8', baseSize: 440, side: 'left', yBias: 0.10, tiltBase: 1.71,
    texture: '/textures/uranus.jpg', atmoColor: [0.38, 0.86, 0.94], atmoThickness: 0.9
  },
  {
    name: 'Neptune', color: '#3050c8', baseSize: 420, side: 'right', yBias: -0.10, tiltBase: 0.49,
    texture: '/textures/neptune.jpg', atmoColor: [0.22, 0.48, 1.00], atmoThickness: 1.1
  },
]

// ── Math ────────────────────────────────────────────────────────────────────
function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

// Scale curve — cinematic flyby, bigger from the start
function getScale(t: number): number {
  if (t <= 0) return 0.35
  if (t < 0.15) return 0.35 + smoothstep(0, 0.15, t) * 0.65
  if (t < 0.35) return 1.00 + smoothstep(0.15, 0.35, t) * 1.20
  if (t < 0.60) return 2.20 + smoothstep(0.35, 0.60, t) * 1.30
  return 3.50 + smoothstep(0.60, 1.0, t) * 2.30
}

// ── Shared geometry ─────────────────────────────────────────────────────────
const sharedGeo = new THREE.SphereGeometry(1, 64, 64)
const glowGeo = new THREE.SphereGeometry(1, 32, 32)

// ── Texture cache ───────────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader()
const textureCache = new Map<string, THREE.Texture>()

function getTexture(path: string): THREE.Texture {
  if (textureCache.has(path)) return textureCache.get(path)!
  const tex = textureLoader.load(path)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  textureCache.set(path, tex)
  return tex
}

// Atmosphere glow — additive with soft edge
function makeGlowMat(r: number, g: number, b: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(r, g, b) } },
    vertexShader: `
      varying vec3 vNormal; varying vec3 vPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPos = (modelViewMatrix * vec4(position,1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying vec3 vNormal; varying vec3 vPos;
      void main() {
        vec3 viewDir = normalize(-vPos);
        float rawRim = 1.0 - max(dot(viewDir, vNormal), 0.0);
        float rim = smoothstep(0.0, 0.45, rawRim) * (1.0 - smoothstep(0.82, 1.0, rawRim));

        vec3 sunDir = normalize(vec3(0.68, 0.25, 0.90));
        float sunFacing = dot(viewDir, sunDir) * 0.5 + 0.5;

        float inner = pow(rim, 4.0) * 0.38;
        float mid = pow(rim, 1.8) * 0.10;
        float totalGlow = (inner + mid) * (0.55 + sunFacing * 0.45);

        vec3 glowCol = mix(uColor * 0.5, mix(uColor, vec3(1.0, 0.97, 0.94), 0.30), pow(rim, 1.5));
        gl_FragColor = vec4(glowCol * totalGlow, totalGlow * 0.45);
      }`,
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// PLANET MESH
// ══════════════════════════════════════════════════════════════════════════════
interface PlanetProps {
  def: PlanetDef
  index: number
  visW: number
}

function PlanetInstance({ def, index, visW }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const rotSpeed = def.earth ? 1.4 : def.name === 'Jupiter' ? 2.2 : def.name === 'Saturn' ? 1.8 : 0.50

  const planetTex = useMemo(() => getTexture(def.texture), [def.texture])
  const cloudTex = useMemo(() => def.earth ? getTexture('/textures/earth_clouds.jpg') : null, [def.earth])

  const blankTex = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat)
    t.needsUpdate = true
    return t
  }, [])

  const uniforms = useMemo(() => ({
    uTexture: { value: planetTex },
    uCloudTex: { value: cloudTex || blankTex },
    uAtmoColor: { value: new THREE.Color(def.atmoColor[0], def.atmoColor[1], def.atmoColor[2]) },
    uTime: { value: 0 },
    uHasClouds: { value: def.earth ? 1.0 : 0.0 },
    uAtmoThickness: { value: def.atmoThickness },
  }), [])

  const glowMat = useMemo(() => makeGlowMat(def.atmoColor[0], def.atmoColor[1], def.atmoColor[2]), [])

  // Physics state — velocity + position for momentum feel
  const physics = useRef({
    x: 0, y: 0, z: -6, s: 0.1,
    vx: 0, vy: 0, vz: 0, vs: 0,
    initialized: false,
  })

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh) return

    const dt = Math.min(delta, 0.05)
    const localT = scrollStore.localTs[index]

    // ── Visibility ──
    if (localT < -0.10 || localT > 1.20) {
      group.visible = false
      return
    }

    const t = Math.max(0, localT)
    const exitSign = def.side === 'left' ? -1 : 1

    // ── X: Starts centered, grows AND slides to exit side ──
    const slideT = smoothstep(0.35, 1.10, t)
    const targetX = exitSign * visW * 0.01 + exitSign * visW * 0.50 * slideT

    // ── Y: Gentle arc ──
    const yArc = 0.06 * Math.sin(Math.min(t, 1.0) * Math.PI)
    const targetY = def.yBias + yArc

    // ── Z: Approaches from deep space, stays close ──
    const zIn = smoothstep(0, 0.35, t)
    const targetZ = -8 + zIn * 12

    // ── Scale   
    const rawScale = getScale(Math.min(t, 1.0))
    const sizeMultiplier = def.baseSize / 420
    const targetScale = Math.min(rawScale * sizeMultiplier, 8.5)

    // ── Spring-damper physics ──
    const p = physics.current
    if (!p.initialized) {
      p.x = 0; p.y = targetY; p.z = -8; p.s = 0.1
      p.initialized = true
    }

    const k = 18.0
    const d = 7.0

    const fx = -k * (p.x - targetX) - d * p.vx
    const fy = -k * (p.y - targetY) - d * p.vy
    const fz = -k * (p.z - targetZ) - d * p.vz
    const fs = -k * (p.s - targetScale) - d * p.vs

    p.vx += fx * dt; p.vy += fy * dt; p.vz += fz * dt; p.vs += fs * dt
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.s += p.vs * dt

    const finalScale = Math.max(0.001, p.s)
    group.position.set(p.x, p.y, p.z)
    group.scale.setScalar(finalScale)

    group.rotation.x = def.tiltBase
    group.rotation.z = exitSign * 0.02

    mesh.rotation.y += rotSpeed * 0.0015
    uniforms.uTime.value = clock.getElapsedTime()

    if (glowRef.current) glowRef.current.scale.setScalar(1.35)

    // Smooth fade during exit
    const opacity = t > 0.85 ? 1 - smoothstep(0.85, 1.10, t) : 1.0
    if (mesh.material) (mesh.material as any).opacity = opacity
    group.visible = opacity > 0.01 && finalScale > 0.01
  })

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={meshRef} geometry={sharedGeo}>
        <shaderMaterial
          vertexShader={vertSrc}
          fragmentShader={fragSrc}
          uniforms={uniforms}
        />
      </mesh>
      <mesh ref={glowRef} geometry={glowGeo} material={glowMat} />
    </group>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE
// ══════════════════════════════════════════════════════════════════════════════
function PlanetScene({ visW }: { visW: number }) {
  const { invalidate } = useThree()
  const setSection = useScrollSectionStore((s) => s.setSection)
  const lastSection = useRef(-1)

  useFrame(() => {
    invalidate()

    for (let i = 0; i < PLANET_COUNT; i++) {
      const lt = scrollStore.localTs[i]
      if (lt >= 0.25 && lt <= 0.75) {
        const sectionSize = PLANET_COUNT / SECTION_IDS.length
        const si = Math.min(SECTION_IDS.length - 1, Math.floor(i / sectionSize))
        if (si !== lastSection.current) {
          lastSection.current = si
          setSection(SECTION_IDS[si])
        }
        break
      }
    }

    scrollStore.smoothProgress = lerp(scrollStore.smoothProgress, scrollStore.progress, 0.06)
  })

  return (
    <>
      <ambientLight intensity={0.04} color="#334488" />
      <directionalLight position={[8, 3, 5]} intensity={1.6} color="#fff5e0" />
      <directionalLight position={[-5, 2, -8]} intensity={0.25} color="#6688cc" />
      <pointLight position={[0, 0, 12]} intensity={0.12} color="#ffffff" distance={30} />

      {PLANETS.map((def, i) => (
        <PlanetInstance key={def.name} def={def} index={i} visW={visW} />
      ))}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function PlanetSystem() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => { initScrollStore() }, [])

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="mobile-gradient-animated absolute inset-0 opacity-70" />
      </div>
    )
  }
  if (reducedMotion) return null

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900
  const camDist = 12
  const fov = 55
  const visH = 2 * camDist * Math.tan((fov / 2) * Math.PI / 180)
  const visW = visH * (vw / vh)

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
      <Canvas
        frameloop="always"
        camera={{ position: [0, 0, camDist], fov, near: 0.1, far: 120 }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          precision: 'mediump',
        }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('PlanetSystem: WebGL context lost, will restore...')
          })
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('PlanetSystem: WebGL context restored')
            gl.setClearColor(0x000000, 0)
          })
        }}
      >
        <PlanetScene visW={visW} />
      </Canvas>
    </div>
  )
}

export default memo(PlanetSystem)
