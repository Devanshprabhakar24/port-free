import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertSrc from '../../shaders/planet.vert.glsl?raw'
import fragSrc from '../../shaders/planet.frag.glsl?raw'

type PlanetType = 0 | 1 | 2 | 3 // generic, earth, gas, rocky

interface SphereMeshProps {
  color: THREE.Color
  glowColor: THREE.Color
  planetType: PlanetType
  rotationSpeed: number
}

function SphereMesh({ color, glowColor, planetType, rotationSpeed }: SphereMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(() => ({
    uColor:     { value: color },
    uGlowColor: { value: glowColor },
    uTime:      { value: 0 },
    uType:      { value: planetType },
  }), [color, glowColor, planetType])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * 0.004
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        vertexShader={vertSrc}
        fragmentShader={fragSrc}
        uniforms={uniforms}
      />
    </mesh>
  )
}

interface PlanetMeshProps {
  size: number
  color: string
  glow: string
  planetType: PlanetType
  rotationSpeed?: number
  opacity: number
  glowIntensity: number   // 0–1, drives outer glow ring size
  glowColor: string
}

export default function PlanetMesh({
  size, color, glow, planetType, rotationSpeed = 1, opacity, glowIntensity, glowColor,
}: PlanetMeshProps) {
  const threeColor = useMemo(() => new THREE.Color(color), [color])
  const threeGlow  = useMemo(() => new THREE.Color(glow.replace(/rgba?\([^)]+\)/, '') || glow), [glow])

  // Parse glow rgba to THREE.Color
  const parsedGlow = useMemo(() => {
    const m = glow.match(/[\d.]+/g)
    if (m && m.length >= 3) return new THREE.Color(+m[0]/255, +m[1]/255, +m[2]/255)
    return threeGlow
  }, [glow, threeGlow])

  const outerGlow = Math.round(size * 0.22 * glowIntensity)

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'absolute',
        borderRadius: '50%',
        overflow: 'visible',
        opacity,
        transition: 'none',
        // Outer atmospheric glow ring using box-shadow only (no canvas glow)
        filter: `drop-shadow(0 0 ${outerGlow}px ${glowColor}) drop-shadow(0 0 ${Math.round(outerGlow * 0.4)}px ${glowColor})`,
      }}
    >
      {/* Clip the canvas to a circle */}
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
        <Canvas
          style={{ width: size, height: size }}
          camera={{ position: [0, 0, 2.6], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <SphereMesh
            color={threeColor}
            glowColor={parsedGlow}
            planetType={planetType}
            rotationSpeed={rotationSpeed}
          />
        </Canvas>
      </div>
    </div>
  )
}
