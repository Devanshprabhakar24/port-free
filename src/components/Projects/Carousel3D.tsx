import { PresentationControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import ProjectCard3D from './ProjectCard3D'
import { useIsMobile } from '../../hooks/useIsMobile'

type Project = {
  title: string
  stack: string
  summary: string
  url: string
  image?: string // Optional project screenshot/image
}

const projects: Project[] = [
  {
    title: 'ZTUBE',
    stack: 'TypeScript, Next.js, PostgreSQL',
    summary: 'Video-sharing SaaS platform with secure authentication and cloud media handling.',
    url: 'https://ztube.vercel.app/home',
    image: '/projects/ztube.svg',
  },
  {
    title: 'Scatch',
    stack: 'Node.js, MongoDB, JWT',
    summary: 'E-commerce platform for premium bags with secure authentication and payment.',
    url: 'https://scatch-xi.vercel.app/',
    image: '/projects/scatch.svg',
  },
  {
    title: 'MyLaundry',
    stack: 'React, Node.js, MongoDB',
    summary: 'Full-stack laundry management with order tracking and admin dashboard.',
    url: 'https://my-laundry-lime.vercel.app/',
    image: '/projects/mylaundry.svg',
  },
  {
    title: 'Vaccine Scheduler',
    stack: 'Node.js, Razorpay, DAG Engine',
    summary: 'Automated scheduling system with notifications and payment integration.',
    url: 'https://github.com',
    image: '/projects/mylaundry.svg', // Reusing existing image
  },
]

function CardRing() {
  const groupRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()

  const positions = useMemo(() => {
    // Bigger ring on desktop, keep mobile size
    const radius = isMobile ? 3.5 : 6
    const depth = isMobile ? 2 : 3.5
    
    return projects.map((_, index) => {
      const theta = (Math.PI * 2 * index) / projects.length
      return {
        position: [Math.cos(theta) * radius, 0, Math.sin(theta) * depth] as [number, number, number],
        rotation: -theta + Math.PI / 2, // Rotate card to face center + 90 degrees
      }
    })
  }, [isMobile])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Slower rotation on mobile for better visibility
      const speed = isMobile ? 0.08 : 0.12
      groupRef.current.rotation.y = clock.getElapsedTime() * speed
    }
  })

  return (
    <PresentationControls 
      global 
      polar={[-0.3, 0.3]} 
      azimuth={[-Infinity, Infinity]} 
      snap={false}
      speed={isMobile ? 0.8 : 1.2}
    >
      <group ref={groupRef}>
        {projects.map((project, index) => (
          <ProjectCard3D
            key={project.title}
            index={index}
            title={project.title}
            stack={project.stack}
            summary={project.summary}
            url={project.url}
            image={project.image}
            position={positions[index].position}
            rotation={positions[index].rotation}
          />
        ))}
      </group>
    </PresentationControls>
  )
}

export default function Carousel3D() {
  const isMobile = useIsMobile()
  
  return (
    <Canvas
      camera={{ 
        position: [0, 0, isMobile ? 8 : 13], 
        fov: isMobile ? 55 : 50 
      }}
      dpr={[1, isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)]}
      gl={{ 
        antialias: !isMobile, // Disable antialiasing on mobile for performance
        alpha: false,
        powerPreference: isMobile ? 'low-power' : 'high-performance'
      }}
      performance={{ min: 0.5 }} // Allow frame rate to drop if needed
    >
      <color attach="background" args={['#0a0a12']} />
      <fog attach="fog" args={['#0a0a12', isMobile ? 6 : 10, isMobile ? 18 : 26]} />
      
      {/* Reduced lighting on mobile */}
      <ambientLight intensity={isMobile ? 0.7 : 0.6} />
      <directionalLight position={[5, 5, 5]} intensity={isMobile ? 0.8 : 1} castShadow={!isMobile} />
      <pointLight position={[0, 3, 0]} intensity={isMobile ? 1.2 : 1.5} color="#7c3aed" />
      {!isMobile && <pointLight position={[-3, 0, 3]} intensity={1.2} color="#ec4899" />}
      {!isMobile && <pointLight position={[3, 0, -3]} intensity={1} color="#fb923c" />}
      
      <CardRing />
    </Canvas>
  )
}
