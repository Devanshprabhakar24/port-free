/* eslint-disable react-hooks/immutability */
import { Text, Text3D } from '@react-three/drei'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface ProjectItem {
  id: string
  name: string
  stacks: [string, string, string]
  gradient: [string, string]
}

interface ProjectCardProps {
  item: ProjectItem
  index: number
  total: number
  activeIndexRef: MutableRefObject<number>
  opacityRef: MutableRefObject<number[]>
  scaleRef: MutableRefObject<number[]>
  meshRefs: MutableRefObject<Array<THREE.Mesh | null>>
  tiltRefs: MutableRefObject<Array<THREE.Vector2>>
  flipRefs: MutableRefObject<number[]>
  cardGroupRefs: MutableRefObject<Array<THREE.Group | null>>
}

interface SceneContentProps {
  groupRef: MutableRefObject<THREE.Group | null>
  activeIndexRef: MutableRefObject<number>
}

interface ParticlesProps {
  count: number
}

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'

const PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    name: 'MyLaundry',
    stacks: ['React', 'Node', 'MongoDB'],
    gradient: ['#7c3aed', '#ec4899'],
  },
  {
    id: 'p2',
    name: 'ZTUBE',
    stacks: ['TypeScript', 'Next.js', 'Cloud'],
    gradient: ['#4f46e5', '#22d3ee'],
  },
  {
    id: 'p3',
    name: 'SaaS Command',
    stacks: ['Prisma', 'Postgres', 'Auth'],
    gradient: ['#ec4899', '#f59e0b'],
  },
  {
    id: 'p4',
    name: 'Insight Studio',
    stacks: ['Three.js', 'GSAP', 'API'],
    gradient: ['#8b5cf6', '#14b8a6'],
  },
]

const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

const createGradientTexture = (start: string, end: string, label: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.Texture()
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, start)
  gradient.addColorStop(1, end)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80)

  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 72px Clash Display, sans-serif'
  ctx.fillText(label, 92, 190)

  ctx.font = '34px Cabinet Grotesk, sans-serif'
  ctx.fillStyle = 'rgba(248,250,252,0.9)'
  ctx.fillText('Production-Ready Full Stack Build', 94, 252)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function FloatingParticles({ count }: ParticlesProps) {
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  const positions = useMemo(() => {
    const list: THREE.Vector3[] = []
    for (let i = 0; i < count; i += 1) {
      const x = (seededRandom(i + 1) - 0.5) * 20
      const y = (seededRandom(i + 2.2) - 0.5) * 9
      const z = (seededRandom(i + 7.8) - 0.5) * 18
      list.push(new THREE.Vector3(x, y, z))
    }
    return list
  }, [count])

  useEffect(() => {
    if (!instancedRef.current) {
      return
    }

    const dummy = new THREE.Object3D()
    positions.forEach((p, index) => {
      dummy.position.copy(p)
      const scale = 0.012 + seededRandom(index + 10) * 0.02
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      instancedRef.current?.setMatrixAt(index, dummy.matrix)
    })
    instancedRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useEffect(() => {
    return () => {
      instancedRef.current?.geometry.dispose()
      materialRef.current?.dispose()
    }
  }, [])

  useFrame((_, delta) => {
    if (!instancedRef.current) {
      return
    }

    instancedRef.current.rotation.y += delta * 0.04
    instancedRef.current.rotation.x += delta * 0.01
  })

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial ref={materialRef} color="#cbd5e1" transparent opacity={0.3} />
    </instancedMesh>
  )
}

function ProjectCard({
  item,
  index,
  total,
  activeIndexRef,
  opacityRef,
  scaleRef,
  meshRefs,
  tiltRefs,
  flipRefs,
  cardGroupRefs,
}: ProjectCardProps) {
  const reducedMotion = usePrefersReducedMotion()
  const frontTexture = useMemo(
    () => createGradientTexture(item.gradient[0], item.gradient[1], item.name),
    [item.gradient, item.name],
  )

  const frontMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  const backMaterialRef = useRef<THREE.MeshStandardMaterial>(null)

  useEffect(() => {
    return () => {
      frontTexture.dispose()
      frontMaterialRef.current?.dispose()
      backMaterialRef.current?.dispose()
    }
  }, [frontTexture])

  const angleDeg = (index - (total - 1) / 2) * 18
  const angle = THREE.MathUtils.degToRad(angleDeg)
  const radius = 5

  const position: [number, number, number] = [Math.sin(angle) * radius, 0, Math.cos(angle) * radius - 6.2]

  const setHoverTilt = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()

    if (!event.uv) {
      return
    }

    const localX = (event.uv.x - 0.5) * 2
    const localY = (event.uv.y - 0.5) * 2

    tiltRefs.current[index] = new THREE.Vector2(
      THREE.MathUtils.degToRad(-localY * 6),
      THREE.MathUtils.degToRad(localX * 6),
    )
  }

  const resetTilt = () => {
    tiltRefs.current[index] = new THREE.Vector2(0, 0)
  }

  const onFlip = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (reducedMotion) {
      flipRefs.current[index] += Math.PI
      return
    }
    const target = flipRefs.current[index] + Math.PI
    gsap.to(flipRefs.current, {
      [index]: target,
      duration: 0.6,
      ease: 'power3.inOut',
      overwrite: true,
    })
  }

  useFrame((_, delta) => {
    const group = cardGroupRefs.current[index]
    const frontMat = frontMaterialRef.current
    const backMat = backMaterialRef.current

    if (!group || !frontMat || !backMat) {
      return
    }

    const isActive = activeIndexRef.current === index
    const targetScale = isActive ? 1 : 0.85
    const targetOpacity = isActive ? 1 : 0.5

    scaleRef.current[index] = THREE.MathUtils.lerp(scaleRef.current[index], targetScale, 0.09)
    opacityRef.current[index] = THREE.MathUtils.lerp(opacityRef.current[index], targetOpacity, 0.09)

    const tilt = tiltRefs.current[index] ?? new THREE.Vector2(0, 0)

    const targetRotX = tilt.x
    const targetRotY = angle + tilt.y + flipRefs.current[index]

    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.09)
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.09)

    group.scale.setScalar(scaleRef.current[index])

    frontMat.opacity = opacityRef.current[index]
    backMat.opacity = opacityRef.current[index]

    const emissiveIntensity = isActive ? 0.28 : 0.1
    frontMat.emissiveIntensity = THREE.MathUtils.lerp(frontMat.emissiveIntensity, emissiveIntensity, Math.min(1, delta * 8))
  })

  return (
    <group
      ref={(el) => {
        cardGroupRefs.current[index] = el
      }}
      position={position}
      onPointerMove={setHoverTilt}
      onPointerOut={resetTilt}
      onClick={onFlip}
    >
      <mesh
        ref={(el) => {
          meshRefs.current[index] = el
        }}
      >
        <planeGeometry args={[2.8, 1.8]} />
        <meshStandardMaterial
          ref={frontMaterialRef}
          map={frontTexture}
          transparent
          opacity={1}
          roughness={0.2}
          metalness={0.18}
          emissive="#111827"
          emissiveIntensity={0.15}
        />
      </mesh>

      <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshStandardMaterial
          ref={backMaterialRef}
          transparent
          opacity={1}
          roughness={0.32}
          metalness={0.08}
          color="#09090f"
        />
      </mesh>

      <group position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
        <Text3D
          font={FONT_URL}
          size={0.15}
          height={0.02}
          curveSegments={6}
          bevelEnabled
          bevelSize={0.004}
          bevelThickness={0.004}
          position={[-1.1, 0.45, 0]}
        >
          {item.name}
          <meshStandardMaterial color="#f1f5f9" emissive="#7c3aed" emissiveIntensity={0.2} />
        </Text3D>

        {item.stacks.map((stack, stackIndex) => (
          <group key={stack} position={[-0.85 + stackIndex * 0.9, 0.1, 0]}>
            <mesh>
              <planeGeometry args={[0.68, 0.2]} />
              <meshStandardMaterial color="#18181f" emissive="#0f172a" emissiveIntensity={0.14} />
            </mesh>
            <Text color="#d1d5db" fontSize={0.07} anchorX="center" anchorY="middle" position={[0, 0, 0.01]}>
              {stack}
            </Text>
          </group>
        ))}

        <group position={[-0.35, -0.55, 0]}>
          <mesh>
            <circleGeometry args={[0.12, 24]} />
            <meshStandardMaterial color="#111827" emissive="#1d4ed8" emissiveIntensity={0.35} />
          </mesh>
          <Text color="#f8fafc" fontSize={0.06} anchorX="center" anchorY="middle" position={[0, 0, 0.01]}>
            GH
          </Text>
        </group>

        <group position={[0.05, -0.55, 0]}>
          <mesh>
            <circleGeometry args={[0.12, 24]} />
            <meshStandardMaterial color="#111827" emissive="#7c3aed" emissiveIntensity={0.35} />
          </mesh>
          <Text color="#f8fafc" fontSize={0.058} anchorX="center" anchorY="middle" position={[0, 0, 0.01]}>
            Live
          </Text>
        </group>
      </group>
    </group>
  )
}

function SceneContent({ groupRef, activeIndexRef }: SceneContentProps) {
  const meshRefs = useRef<Array<THREE.Mesh | null>>([])
  const cardGroupRefs = useRef<Array<THREE.Group | null>>([])
  const tiltRefs = useRef<Array<THREE.Vector2>>([])
  const opacityRef = useRef<number[]>(Array(PROJECTS.length).fill(1))
  const scaleRef = useRef<number[]>(Array(PROJECTS.length).fill(0.85))
  const flipRefs = useRef<number[]>(Array(PROJECTS.length).fill(0))

  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3.4, 2]} intensity={1.35} color="#8b5cf6" />
      <pointLight position={[0, -2.6, 1.5]} intensity={0.9} color="#ec4899" />

      <group ref={groupRef}>
        {PROJECTS.map((item, index) => (
          <ProjectCard
            key={item.id}
            item={item}
            index={index}
            total={PROJECTS.length}
            activeIndexRef={activeIndexRef}
            opacityRef={opacityRef}
            scaleRef={scaleRef}
            meshRefs={meshRefs}
            tiltRefs={tiltRefs}
            flipRefs={flipRefs}
            cardGroupRefs={cardGroupRefs}
          />
        ))}
      </group>

      <FloatingParticles count={1000} />

    </>
  )
}

function ProjectsScene() {
  const reducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const activeIndexRef = useRef(0)
  const groupRef = useRef<THREE.Group | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches || reducedMotion) {
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${window.innerHeight * 4}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        setProgress(self.progress)

        const maxIndex = PROJECTS.length - 1
        const active = Math.round(self.progress * maxIndex)
        activeIndexRef.current = active
        setActiveIndex(active)

        if (groupRef.current) {
          const targetRotation = -self.progress * THREE.MathUtils.degToRad(54)
          gsap.to(groupRef.current.rotation, {
            y: targetRotation,
            duration: 0.35,
            ease: 'power3.out',
            overwrite: true,
          })
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.1, 4.3], fov: 48 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* Transparent background — the site's space background shows through */}
        <SceneContent groupRef={groupRef} activeIndexRef={activeIndexRef} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center">
        <div className="w-[min(560px,80vw)]">
          <div className="h-px w-full bg-white/15">
            <div
              className="h-full bg-linear-to-r from-violet-500 to-pink-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <HtmlOverlay activeIndex={activeIndex} />
    </section>
  )
}

interface HtmlOverlayProps {
  activeIndex: number
}

function HtmlOverlay({ activeIndex }: HtmlOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute right-8 top-1/2 -translate-y-1/2 font-display text-[18vw] leading-none text-white/[0.05]">
        {String(activeIndex + 1).padStart(2, '0')}
      </div>
    </div>
  )
}

export default memo(ProjectsScene)
