import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import vertSrc from '../../shaders/planet.vert.glsl?raw'
import fragSrc from '../../shaders/planet.frag.glsl?raw'

function getType(earth?: boolean, bands?: boolean, color?: string): number {
  if (earth) return 1
  if (bands) return 2
  if (color && (color.startsWith('#8') || color.startsWith('#c1') || color.startsWith('#c8'))) return 3
  return 0
}

interface ColorConfig {
  surfaceA: THREE.Color
  surfaceB: THREE.Color
  atmo: THREE.Color
}

function buildColors(color: string, glow: string, earth?: boolean, bands?: boolean): ColorConfig {
  const base = new THREE.Color(color)
  const matches = glow.match(/[\d.]+/g)
  const atmo = matches && matches.length >= 3
    ? new THREE.Color(+matches[0] / 255, +matches[1] / 255, +matches[2] / 255)
    : base.clone()

  if (earth) {
    return {
      surfaceA: new THREE.Color('#114a9a'),
      surfaceB: new THREE.Color('#64c86a'),
      atmo: atmo.clone().lerp(new THREE.Color('#4ca3ff'), 0.35),
    }
  }

  if (bands) {
    // Jupiter gets warmer contrast; Saturn gets softer beige bands.
    if (color.toLowerCase() === '#c88b3a') {
      return {
        surfaceA: new THREE.Color('#8f5d2a'),
        surfaceB: new THREE.Color('#dfc08e'),
        atmo: atmo.clone().lerp(new THREE.Color('#87aee8'), 0.25),
      }
    }

    return {
      surfaceA: new THREE.Color('#9f8450'),
      surfaceB: new THREE.Color('#e4d0a2'),
      atmo: atmo.clone().lerp(new THREE.Color('#9cb4dc'), 0.2),
    }
  }

  // Rocky palette refinement for Venus and Mars.
  if (color.toLowerCase() === '#c8a050') {
    return {
      surfaceA: new THREE.Color('#8f6c36'),
      surfaceB: new THREE.Color('#cfac6c'),
      atmo: atmo.clone().lerp(new THREE.Color('#d9b27b'), 0.25),
    }
  }

  if (color.toLowerCase() === '#c1440e') {
    return {
      surfaceA: new THREE.Color('#8b2e12'),
      surfaceB: new THREE.Color('#d16a3a'),
      atmo: atmo.clone().lerp(new THREE.Color('#c96442'), 0.28),
    }
  }

  // Ice giants use stronger dual-tone contrast.
  if (color.toLowerCase() === '#7de8e8') {
    return {
      surfaceA: new THREE.Color('#3fa7b4'),
      surfaceB: new THREE.Color('#9cf2f0'),
      atmo: atmo.clone().lerp(new THREE.Color('#8de9ff'), 0.3),
    }
  }

  if (color.toLowerCase() === '#3050c8') {
    return {
      surfaceA: new THREE.Color('#1d3d9e'),
      surfaceB: new THREE.Color('#6a8cff'),
      atmo: atmo.clone().lerp(new THREE.Color('#5f9cff'), 0.34),
    }
  }

  const surfaceB = base.clone().multiplyScalar(1.55)

  return { surfaceA: base, surfaceB, atmo }
}

interface MeshProps {
  surfaceA: THREE.Color
  surfaceB: THREE.Color
  atmo: THREE.Color
  uType: number
  rotSpeed: number
  localT: number
}

function PlanetMeshInner({ surfaceA, surfaceB, atmo, uType, rotSpeed, localT }: MeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { invalidate } = useThree()

  const uniforms = useMemo(
    () => ({
      uSurfaceA: { value: surfaceA.clone() },
      uSurfaceB: { value: surfaceB.clone() },
      uAtmoColor: { value: atmo.clone() },
      uTime: { value: 0 },
      uType: { value: uType },
    }),
    [],
  )

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    if (meshRef.current) meshRef.current.rotation.y += rotSpeed * 0.003
    if (localT > 0.05 && localT < 1.05) invalidate()
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 96, 96]} />
      <shaderMaterial
        vertexShader={vertSrc}
        fragmentShader={fragSrc}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export interface PlanetCanvasProps {
  size: number
  color: string
  glow: string
  earth?: boolean
  bands?: boolean
  opacity: number
  blurPx: number
  glowSpreadPx: number
  localT: number
}

export default function PlanetCanvas({
  size,
  color,
  glow,
  earth,
  bands,
  opacity,
  blurPx,
  glowSpreadPx,
  localT,
}: PlanetCanvasProps) {
  const { surfaceA, surfaceB, atmo } = useMemo(
    () => buildColors(color, glow, earth, bands),
    [color, glow, earth, bands],
  )

  const uType = getType(earth, bands, color)
  const rotSpeed = earth ? 1.6 : bands ? 0.8 : 0.45

  const filterStr = [
    glowSpreadPx > 2 ? `drop-shadow(0 0 ${glowSpreadPx}px ${glow})` : '',
    glowSpreadPx > 6 ? `drop-shadow(0 0 ${Math.round(glowSpreadPx * 0.45)}px ${glow})` : '',
    blurPx > 0.4 ? `blur(${blurPx.toFixed(1)}px)` : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        opacity,
        filter: filterStr || undefined,
        willChange: 'opacity, filter',
        transition: 'none',
      }}
    >
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 2.55], fov: 38 }}
          dpr={Math.min(window.devicePixelRatio, 1.5)}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          style={{ width: size, height: size, display: 'block' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 1)
          }}
        >
          <PlanetMeshInner
            surfaceA={surfaceA}
            surfaceB={surfaceB}
            atmo={atmo}
            uType={uType}
            rotSpeed={rotSpeed}
            localT={localT}
          />
        </Canvas>
      </div>
    </div>
  )
}
