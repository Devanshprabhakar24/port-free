import { useDetectGPU } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import type { MousePosition } from '../../hooks/useMousePosition'
import { useIsMobile } from '../../hooks/useIsMobile'

const NEAR_STAR_COUNT = 1500
const MID_STAR_COUNT = 2000
const FAR_STAR_COUNT = 1500
const SHOOTING_STAR_COUNT = 24
const ASTEROID_COUNT = 80
const NEBULA_POSITIONS: Array<[number, number, number]> = [
  [-8, 3, -15],
  [10, -2, -20],
  [0, 8, -18],
  [-5, -6, -12],
  [7, 5, -25],
]

type StarLayerProps = {
  count: number
  size: number
  color: THREE.ColorRepresentation
  opacity: number
  driftSpeed: number
  rotationSpeed: number
}

function DistortedSphere({ mouse, idle, isMobile }: { mouse: MousePosition; idle: boolean; isMobile: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) {
      return
    }

    const targetPosX = !isMobile ? 1.2 : 0;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x || 0, targetPosX, 0.03);
    const baseScale = !isMobile ? 1.35 : 1.0;
    const breathe = baseScale * (1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02);
    groupRef.current.scale.setScalar(breathe);

    if (idle) {
      groupRef.current.rotation.y += delta * 0.1
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.smoothY * 0.12, 0.05)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.smoothX * 0.16, 0.05)
  })

  return (
    <group ref={groupRef}>
      <mesh scale={0.9}>
        <sphereGeometry args={[0.75, 96, 96]} />
        <meshStandardMaterial color="#2e1065" emissive="#7c3aed" emissiveIntensity={0.2} roughness={0.72} metalness={0.08} />
      </mesh>

      <mesh scale={0.98}>
        <sphereGeometry args={[0.75, 96, 96]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.09} side={THREE.BackSide} />
      </mesh>

      <mesh position={[0.34, 0.18, 0.64]}>
        <sphereGeometry args={[0.022, 20, 20]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>
      <mesh position={[-0.32, -0.17, 0.58]}>
        <sphereGeometry args={[0.016, 20, 20]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      <mesh position={[0.13, -0.38, 0.56]}>
        <sphereGeometry args={[0.018, 20, 20]} />
        <meshBasicMaterial color="#fb923c" />
      </mesh>
    </group>
  )
}

function StarLayer({ count, size, color, opacity, driftSpeed, rotationSpeed }: StarLayerProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const shaderRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const sizes = new Float32Array(count)

    const pseudoRandom = (value: number) => {
      const s = Math.sin(value * 12.9898) * 43758.5453
      return s - Math.floor(s)
    }

    for (let i = 0; i < count; i += 1) {
      const angle = i * 0.22
      const radius = 0.4 + i * 0.0011
      const branchOffset = (i % 5) * ((Math.PI * 2) / 5)
      const r1 = pseudoRandom(i + 1)
      const r2 = pseudoRandom(i + 11)
      const r3 = pseudoRandom(i + 31)
      const r4 = pseudoRandom(i + 53)
      const r5 = pseudoRandom(i + 71)

      positions[i * 3 + 0] = Math.cos(angle + branchOffset) * radius + (r1 - 0.5) * 0.28
      positions[i * 3 + 1] = (r2 - 0.5) * 2.1
      positions[i * 3 + 2] = Math.sin(angle + branchOffset) * radius + (r3 - 0.5) * 0.28
      seeds[i] = r4
      sizes[i] = 0.5 + r5 * 1.5
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    return geo
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: opacity },
          uColor: { value: new THREE.Color(color) },
          uPointScale: { value: size },
        },
        vertexShader: `
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uPointScale;
varying float vSeed;
varying float vFar;

void main() {
  vSeed = aSeed;
  vec3 pos = position;
  pos.y += sin(uTime * 0.35 + aSeed * 20.0) * 0.03;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vFar = smoothstep(-12.0, 4.0, mvPosition.z);
  float pointSize = aSize * uPointScale * (95.0 / -mvPosition.z);
  gl_PointSize = clamp(pointSize, 0.5, 2.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,
        fragmentShader: `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
varying float vSeed;
varying float vFar;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float pulse = 0.45 + 0.55 * sin(uTime * 1.3 + vSeed * 30.0);
  float alpha = smoothstep(0.5, 0.0, d) * pulse;
  vec3 nearColor = vec3(0.93, 0.94, 1.0);
  vec3 farColor = vec3(0.5, 0.68, 1.0);
  vec3 color = mix(nearColor, farColor, vFar);
  color = mix(color, uColor, 0.6);
  color = mix(color, vec3(0.49, 0.23, 0.93), vSeed * 0.2);
  gl_FragColor = vec4(color, alpha * uOpacity);
}
`,
      }),
    [color, opacity, size],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((_, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta * driftSpeed * 1000
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * rotationSpeed
      pointsRef.current.rotation.x += delta * rotationSpeed * 0.35
    }
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}

function ShootingStars() {
  const streakRefs = useRef<Array<THREE.Mesh | null>>([])
  const materialsRef = useRef<Array<THREE.MeshBasicMaterial | null>>([])
  const timersRef = useRef<number[]>([])

  const stars = useMemo(() => {
    return Array.from({ length: SHOOTING_STAR_COUNT }, (_, index) => {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        -6 - Math.random() * 22,
      )
      const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.2, -1).normalize()
      const length = 0.5 + Math.random() * 1.5
      const end = start.clone().addScaledVector(direction, length)
      const midpoint = start.clone().add(end).multiplyScalar(0.5)
      return { midpoint, direction, length, delay: 1200 + index * 180, duration: 220 + Math.random() * 260 }
    })
  }, [])

  useEffect(() => {
    const schedule = () => {
      stars.forEach((star, index) => {
        const timer = window.setTimeout(() => {
          const material = materialsRef.current[index]
          if (!material) {
            return
          }

          material.opacity = 1
          const fadeOut = window.setTimeout(() => {
            material.opacity = 0
          }, star.duration)
          timersRef.current.push(fadeOut)
        }, star.delay + Math.random() * 7000)

        timersRef.current.push(timer)
      })
    }

    schedule()
    const interval = window.setInterval(schedule, 9000)
    timersRef.current.push(interval)

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
    }
  }, [stars])

  return (
    <group>
      {stars.map((star, index) => {
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), star.direction)

        return (
          <mesh
            key={index}
            ref={(el) => {
              streakRefs.current[index] = el
            }}
            position={[star.midpoint.x, star.midpoint.y, star.midpoint.z]}
            quaternion={quaternion}
            scale={[star.length, 1, 1]}
          >
            <cylinderGeometry args={[0.008, 0.02, 1, 6, 1, true]} />
            <meshBasicMaterial
              ref={(mat) => {
                materialsRef.current[index] = mat
              }}
              color="#f8fafc"
              transparent
              opacity={0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function NebulaClouds() {
  const cloudRefs = useRef<Array<THREE.Sprite | null>>([])

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return new THREE.CanvasTexture(canvas)
    }

    const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(88,28,135,0.6)')
    gradient.addColorStop(0.45, 'rgba(88,28,135,0.28)')
    gradient.addColorStop(1, 'rgba(88,28,135,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [])

  useEffect(() => {
    return () => {
      texture.dispose()
    }
  }, [texture])

  useFrame((_, delta) => {
    cloudRefs.current.forEach((cloud, index) => {
      if (!cloud) {
        return
      }

      cloud.position.x += Math.sin(index + delta) * 0.0001
      cloud.position.y += Math.cos(index + delta) * 0.0001
      cloud.rotation.z += delta * 0.02
      cloud.rotation.y += delta * 0.01
    })
  })

  const cloudColors = ['#581c87', '#1e3a8a', '#831843', '#581c87', '#1e3a8a']

  return (
    <group>
      {NEBULA_POSITIONS.map((position, index) => (
        <sprite
          key={index}
          ref={(el) => {
            cloudRefs.current[index] = el
          }}
          position={position}
          scale={[7 + index, 7 + index, 1]}
        >
          <spriteMaterial map={texture} color={cloudColors[index]} transparent opacity={0.9} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

function PlanetAndRing() {
  const planetRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0006
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.0008
    }
  })

  return (
    <group position={[4.2, 1.6, -3.4]}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.35, 64, 64]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh ref={ringRef} rotation={[THREE.MathUtils.degToRad(70), 0, 0]}>
        <torusGeometry args={[1.8, 0.08, 8, 60]} />
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.6} roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  )
}

function AsteroidBelt() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const positions = useMemo(() => {
    return Array.from({ length: ASTEROID_COUNT }, (_, index) => {
      const angle = (index / ASTEROID_COUNT) * Math.PI * 2
      const radius = 5 + Math.sin(index * 0.9) * 0.5
      const height = Math.cos(index * 1.3) * 0.35
      return {
        angle,
        radius,
        height,
        speed: 0.0005 + (index % 7) * 0.00008,
      }
    })
  }, [])

  useEffect(() => {
    if (!meshRef.current) {
      return
    }

    const dummy = new THREE.Object3D()
    positions.forEach((item, index) => {
      const x = Math.cos(item.angle) * item.radius
      const z = Math.sin(item.angle) * item.radius
      dummy.position.set(x, item.height, z)
      const scale = 0.7 + (index % 5) * 0.15
      dummy.scale.setScalar(scale * 0.02)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(index, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return
    }

    const dummy = new THREE.Object3D()
    positions.forEach((item, index) => {
      item.angle += delta * item.speed * 120
      const x = Math.cos(item.angle) * item.radius
      const z = Math.sin(item.angle) * item.radius
      dummy.position.set(x, item.height, z)
      dummy.rotation.set(item.angle, item.angle * 0.7, item.angle * 0.4)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(index, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ASTEROID_COUNT]}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshStandardMaterial color="#475569" roughness={1} metalness={0} />
    </instancedMesh>
  )
}

function CameraRig({
  mouse,
  idle,
  children,
}: {
  mouse: MousePosition
  idle: boolean
  children: ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)
  const idleTimer = useRef(0)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    timeRef.current += delta

    if (mouse.speed < 0.2) {
      idleTimer.current += delta
    } else {
      idleTimer.current = 0
    }

    const drift = idle && idleTimer.current > 4 ? Math.sin(timeRef.current * 0.2) * 0.08 : 0

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouse.smoothY * 0.2 + drift * 0.25, 0.05)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.smoothX * 0.2 + drift, 0.05)
  })

  return <group ref={groupRef} position={[-0.8, 0.02, 0]}>{children}</group>
}

function HeroScene({ mouse }: { mouse: MousePosition }) {
  const gpu = useDetectGPU()
  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const idle = !reducedMotion
  const isLowGPU = (gpu?.tier ?? 2) <= 1

  // Mobile optimization: reduced particle counts and simplified effects
  const nearStarCount = isMobile ? 300 : NEAR_STAR_COUNT
  const midStarCount = isMobile ? 400 : MID_STAR_COUNT
  const farStarCount = isMobile ? 300 : FAR_STAR_COUNT
  const asteroidCount = isMobile ? 0 : ASTEROID_COUNT

  return (
    <Canvas
      camera={{ position: [0, 0, 4.65], fov: 58 }}
      dpr={[1, isMobile ? 1 : Math.min(window.devicePixelRatio, 2)]}
      gl={{ antialias: !isMobile, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#03010a'), 1)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.96
      }}
      className="h-full w-full"
    >
      <fogExp2 attach="fog" args={['#07070d', 0.065]} />
      <ambientLight color="#0a0520" intensity={isLowGPU || isMobile ? 0.44 : 0.26} />
      <pointLight position={[3.8, 3.6, 2.4]} intensity={isMobile ? 4 : 8.5} color="#7c3aed" distance={14} />
      <pointLight position={[-2.4, -2.6, 1.6]} intensity={isMobile ? 2 : 3.6} color="#ec4899" distance={9} />
      <pointLight position={[0, 8, -4]} color="#3b82f6" intensity={isMobile ? 3 : 5.8} distance={110} />
      <pointLight position={[-8, 0, 2]} color="#7c3aed" intensity={isMobile ? 1.5 : 2.5} distance={90} />
      <directionalLight position={[4, 2, -2]} intensity={isMobile ? 1 : 1.6} color="#ec4899" />
      <CameraRig mouse={mouse} idle={idle}>
<DistortedSphere mouse={mouse} idle={idle} isMobile={isMobile} />
        <StarLayer count={nearStarCount} size={1.5} color="#ffffff" opacity={0.85} driftSpeed={0.00008} rotationSpeed={0.01} />
        <StarLayer count={midStarCount} size={0.8} color="#a5b4fc" opacity={0.55} driftSpeed={0.00012} rotationSpeed={isMobile ? 0.008 : 0.018} />
        <StarLayer count={farStarCount} size={0.4} color="#ffffff" opacity={0.3} driftSpeed={0.00004} rotationSpeed={isMobile ? 0.002 : 0.004} />
        {!isMobile && <ShootingStars />}
        {!isMobile && <NebulaClouds />}
        <PlanetAndRing />
        {asteroidCount > 0 && <AsteroidBelt />}
      </CameraRig>
    </Canvas>
  )
}

export default memo(HeroScene)
