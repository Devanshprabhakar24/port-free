import { PresentationControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import ProjectCard3D from './ProjectCard3D'

type Project = {
  title: string
  stack: string
  summary: string
  url: string
}

const projects: Project[] = [
  {
    title: 'MyLaundry',
    stack: 'React, Node.js, MongoDB',
    summary: 'Full-stack laundry management with real-time tracking and admin dashboard.',
    url: 'https://github.com',
  },
  {
    title: 'ZTUBE',
    stack: 'TypeScript, Next.js, Cloud Storage',
    summary: 'Video-sharing SaaS with upload, compression, and media management.',
    url: 'https://github.com',
  },
  {
    title: 'SaaS Command',
    stack: 'Next.js, Prisma, PostgreSQL',
    summary: 'Multi-tenant admin suite with auth, billing, and role management.',
    url: 'https://github.com',
  },
]

function CardRing() {
  const groupRef = useRef<THREE.Group>(null)

  const positions = useMemo(() => {
    return projects.map((_, index) => {
      const theta = (Math.PI * 2 * index) / projects.length
      return [Math.cos(theta) * 2.1, 0, Math.sin(theta) * 1.2] as [number, number, number]
    })
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15
    }
  })

  return (
    <PresentationControls global polar={[-0.2, 0.2]} azimuth={[-0.7, 0.7]} speed={1.1}>
      <group ref={groupRef}>
        {projects.map((project, index) => (
          <ProjectCard3D
            key={project.title}
            index={index}
            title={project.title}
            stack={project.stack}
            summary={project.summary}
            url={project.url}
            position={positions[index]}
          />
        ))}
      </group>
    </PresentationControls>
  )
}

export default function Carousel3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[2, 2, 3]} intensity={1.6} color="#7c3aed" />
      <pointLight position={[-2, -1, 2]} intensity={1.2} color="#ec4899" />
      <CardRing />
    </Canvas>
  )
}
