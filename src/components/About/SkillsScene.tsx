import { Html } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useDetectWebGL } from '../../hooks/useDetectWebGL'
import { useIsMobile } from '../../hooks/useIsMobile'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'

type SkillCategory = 'frontend' | 'backend' | 'devops'

type SkillNodeData = {
  name: string
  category: SkillCategory
  original: THREE.Vector3
  speed: number
  offset: number
}

type LinkPair = {
  from: string
  to: string
}

const SKILLS: SkillNodeData[] = [
  { name: 'TypeScript', category: 'frontend', original: new THREE.Vector3(0.9, 1.7, 0.1), speed: 0.42, offset: 0.2 },
  { name: 'GSAP', category: 'frontend', original: new THREE.Vector3(2.8, 1.2, 0.2), speed: 0.61, offset: 1.1 },
  { name: 'React', category: 'frontend', original: new THREE.Vector3(2.2, 0.3, 0.15), speed: 0.52, offset: 2.2 },
  { name: 'Prisma', category: 'backend', original: new THREE.Vector3(3.1, -0.3, 0.25), speed: 0.58, offset: 0.9 },
  { name: 'Framer', category: 'frontend', original: new THREE.Vector3(3.4, -1.35, 0.1), speed: 0.45, offset: 1.7 },
  { name: 'Node.js', category: 'backend', original: new THREE.Vector3(1.6, -2.0, 0.25), speed: 0.41, offset: 0.4 },
  { name: 'PostgreSQL', category: 'backend', original: new THREE.Vector3(2.15, -3.05, 0.2), speed: 0.57, offset: 2.8 },
  { name: 'GraphQL', category: 'backend', original: new THREE.Vector3(0.0, -2.35, 0.1), speed: 0.35, offset: 1.9 },
  { name: 'AWS', category: 'devops', original: new THREE.Vector3(0.25, -3.35, 0.22), speed: 0.63, offset: 2.5 },
  { name: 'Three.js', category: 'frontend', original: new THREE.Vector3(-0.45, -1.2, 0.3), speed: 0.39, offset: 0.7 },
  { name: 'Docker', category: 'devops', original: new THREE.Vector3(0.85, -0.35, 0.25), speed: 0.55, offset: 2.1 },
  { name: 'Redis', category: 'backend', original: new THREE.Vector3(-0.45, 0.55, 0.2), speed: 0.48, offset: 1.3 },
]

const LINKS: LinkPair[] = [
  { from: 'React', to: 'Node.js' },
  { from: 'React', to: 'Docker' },
  { from: 'TypeScript', to: 'React' },
  { from: 'GSAP', to: 'Framer' },
  { from: 'Framer', to: 'Prisma' },
  { from: 'Node.js', to: 'PostgreSQL' },
  { from: 'Node.js', to: 'GraphQL' },
  { from: 'GraphQL', to: 'AWS' },
  { from: 'Redis', to: 'Three.js' },
  { from: 'Docker', to: 'Prisma' },
]

const categoryColor = (category: SkillCategory) => {
  if (category === 'frontend') {
    return '#7c3aed'
  }
  if (category === 'backend') {
    return '#2563eb'
  }
  return '#dc2626'
}

const categoryBorder = (category: SkillCategory) => {
  if (category === 'frontend') {
    return 'rgba(124,58,237,0.3)'
  }
  if (category === 'backend') {
    return 'rgba(37,99,235,0.3)'
  }
  return 'rgba(220,38,38,0.3)'
}

function SkillsCloud() {
  const groupRef = useRef<THREE.Group>(null)
  const nodeRefs = useRef<Array<THREE.Group | null>>([])
  const nebulaRef = useRef<THREE.Sprite>(null)
  const cameraBaseRef = useRef<number>(0)
  const rayPoint = useMemo(() => new THREE.Vector3(), [])
  const pushDir = useMemo(() => new THREE.Vector3(), [])
  const targetPos = useMemo(() => new THREE.Vector3(), [])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const nodes = useMemo(() => SKILLS, [])

  const linkPositions = useMemo(() => {
    const byName = new Map(nodes.map((n) => [n.name, n.original]))
    return LINKS.map((pair) => ({
      ...pair,
      fromPos: byName.get(pair.from) ?? new THREE.Vector3(),
      toPos: byName.get(pair.to) ?? new THREE.Vector3(),
    }))
  }, [nodes])

  const lineObjects = useMemo(() => {
    return linkPositions.map((line) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([line.fromPos.clone(), line.toPos.clone()])
      const material = new THREE.LineDashedMaterial({
        color: '#7c3aed',
        transparent: true,
        opacity: 0.15,
        linewidth: 1,
        dashSize: 0.2,
        gapSize: 0.3,
      })

      const dashedLine = new THREE.Line(geometry, material)
      dashedLine.computeLineDistances()
      return dashedLine
    })
  }, [linkPositions])

  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return new THREE.CanvasTexture(canvas)
    }

    const gradient = ctx.createRadialGradient(128, 128, 24, 128, 128, 128)
    gradient.addColorStop(0, 'rgba(124,58,237,0.12)')
    gradient.addColorStop(1, 'rgba(124,58,237,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  useEffect(() => {
    return () => {
      nebulaTexture.dispose()
      lineObjects.forEach((line) => {
        line.geometry.dispose()
        const material = line.material
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose())
        } else {
          material.dispose()
        }
      })
    }
  }, [lineObjects, nebulaTexture])

  useFrame(({ clock, camera, pointer, raycaster }) => {
    const elapsed = clock.getElapsedTime()
    if (!groupRef.current) {
      return
    }

    groupRef.current.rotation.y += 0.0006

    const cameraOffset = Math.sin(elapsed * 0.22) * 0.3
    if (cameraBaseRef.current === 0) {
      cameraBaseRef.current = camera.position.x
    }
    camera.position.x = cameraOffset
    camera.position.y = 1
    camera.position.z = 6
    camera.lookAt(0, 0, 0)

    nodes.forEach((node, index) => {
      const nodeGroup = nodeRefs.current[index]
      if (!nodeGroup) {
        return
      }

      const floatY = Math.sin(elapsed * node.speed + node.offset) * 0.15
      targetPos.copy(node.original)
      targetPos.y += floatY

      raycaster.setFromCamera(pointer, camera)
      raycaster.ray.closestPointToPoint(nodeGroup.position, rayPoint)
      const distance = nodeGroup.position.distanceTo(rayPoint)

      if (distance < 1.5) {
        pushDir.copy(nodeGroup.position).sub(rayPoint).normalize()
        const strength = (1.5 - distance) * 0.08
        targetPos.addScaledVector(pushDir, strength)
      }

      nodeGroup.position.lerp(targetPos, 0.04)

      const dotMesh = nodeGroup.children[0] as THREE.Mesh | undefined
      if (dotMesh) {
        const hover = hoveredIndex === index
        dotMesh.scale.setScalar(hover ? 1.24 : 1)
      }
    })

    if (nebulaRef.current) {
      const pulse = 3.2 + Math.sin(elapsed * 1.1) * 0.2
      nebulaRef.current.scale.set(pulse, pulse, 1)
    }
  })

  return (
    <group ref={groupRef}>
      <sprite ref={nebulaRef} position={[0, 0, 0]} scale={[3, 3, 1]}>
        <spriteMaterial map={nebulaTexture} transparent depthWrite={false} opacity={1} />
      </sprite>

      {lineObjects.map((line, index) => (
        <primitive key={`${index}-${line.uuid}`} object={line} />
      ))}

      {nodes.map((node, index) => (
        <group key={node.name} position={node.original.toArray()} ref={(el) => {
          nodeRefs.current[index] = el
        }}>
          <mesh
            onPointerOver={(event) => {
              event.stopPropagation()
              setHoveredIndex(index)
            }}
            onPointerOut={() => setHoveredIndex((prev) => (prev === index ? null : prev))}
            onClick={(event) => {
              event.stopPropagation()
              setHoveredIndex((prev) => (prev === index ? null : index))
            }}
          >
            <sphereGeometry args={[0.085, 24, 24]} />
            <meshStandardMaterial color={categoryColor(node.category)} emissive={categoryColor(node.category)} emissiveIntensity={0.9} />
          </mesh>

          <Html position={[0.62, 0.05, 0]} center>
            <div
              style={{
                padding: '5px 12px',
                borderRadius: '9999px',
                border: `1px solid ${categoryBorder(node.category)}`,
                background: 'rgba(255,255,255,0.05)',
                color: categoryColor(node.category),
                fontSize: '12px',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)',
                boxShadow: hoveredIndex === index ? `0 0 20px ${categoryBorder(node.category)}` : 'none',
              }}
            >
              {node.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

function SkillsScene() {
  const isMobile = useIsMobile()
  const hasWebGL = useDetectWebGL()

  if (isMobile || !hasWebGL) {
    return <div className="h-full w-full bg-[#07070d] mobile-gradient-animated" />
  }

  return (
    <ErrorBoundary fallback={
      <div className="flex h-full items-center justify-center bg-[#07070d] p-8 text-center">
        <div className="max-w-sm rounded-xl border border-purple-500/30 bg-purple-950/20 p-6 backdrop-blur-sm">
          <h3 className="mb-2 text-xl font-bold text-white">Graphics Preview</h3>
          <p className="mb-4 text-purple-100">Your device doesn&apos;t support interactive 3D. Still see my skills below 👇</p>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="flex h-full items-center justify-center bg-[#07070d]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-400" />
        </div>
      }>
        <div className="h-full w-full bg-[#07070d]">
          <Canvas
            camera={{ position: [0, 1, 6], fov: 50 }}
            dpr={[1, isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: '#07070d' }}
          >
            <color attach="background" args={['#07070d']} />
            <ambientLight intensity={0.28} />
            <pointLight position={[2, 4, 3]} intensity={1.25} color="#7c3aed" />
            <pointLight position={[-2, -3, 1]} intensity={0.9} color="#2563eb" />
            <pointLight position={[0, 2, -5]} intensity={0.6} color="#dc2626" />
            <SkillsCloud />
          </Canvas>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

export default memo(SkillsScene)
