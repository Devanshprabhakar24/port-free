import { PresentationControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
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
    title: 'WombTo18',
    stack: 'Node.js, Razorpay, DAG Engine',
    summary: 'Complete child health journey tracker with vaccination reminders and growth monitoring.',
    url: 'https://child-module.vercel.app',
    image: '/projects/wombto18.svg',
  },
]

function CardRing({ targetRotation, isManual }: { targetRotation: number; isManual: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  const autoRotationRef = useRef(0)

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
      if (isManual) {
        // Smoothly interpolate to target rotation
        const current = groupRef.current.rotation.y
        const diff = targetRotation - current
        groupRef.current.rotation.y += diff * 0.1
      } else {
        // Auto rotation
        const speed = isMobile ? 0.08 : 0.12
        autoRotationRef.current = clock.getElapsedTime() * speed
        groupRef.current.rotation.y = autoRotationRef.current
      }
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
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [targetRotation, setTargetRotation] = useState(0)

  const goToProject = (index: number) => {
    setSelectedProject(index)
    // Calculate rotation to show selected project at front
    const rotation = (Math.PI * 2 * index) / projects.length
    setTargetRotation(rotation)
  }

  const resetToAuto = () => {
    setSelectedProject(null)
  }
  
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ 
          position: [0, 0, isMobile ? 8 : 13], 
          fov: isMobile ? 55 : 50 
        }}
        dpr={[1, isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)]}
        gl={{ 
          antialias: !isMobile,
          alpha: false,
          powerPreference: isMobile ? 'low-power' : 'high-performance'
        }}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#0a0a12']} />
        <fog attach="fog" args={['#0a0a12', isMobile ? 6 : 10, isMobile ? 18 : 26]} />
        
        <ambientLight intensity={isMobile ? 0.7 : 0.6} />
        <directionalLight position={[5, 5, 5]} intensity={isMobile ? 0.8 : 1} castShadow={!isMobile} />
        <pointLight position={[0, 3, 0]} intensity={isMobile ? 1.2 : 1.5} color="#7c3aed" />
        {!isMobile && <pointLight position={[-3, 0, 3]} intensity={1.2} color="#ec4899" />}
        {!isMobile && <pointLight position={[3, 0, -3]} intensity={1} color="#fb923c" />}
        
        <CardRing targetRotation={targetRotation} isManual={selectedProject !== null} />
      </Canvas>

      {/* Project Selection Buttons */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-black/60 via-black/50 to-black/40 p-3 shadow-2xl backdrop-blur-xl">
          {/* Auto Button */}
          <button
            onClick={resetToAuto}
            className={`group relative overflow-hidden rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              selectedProject === null ? 'scale-105' : 'scale-100 hover:scale-105'
            }`}
          >
            <div className={`absolute inset-0 transition-all ${
              selectedProject === null
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 opacity-100'
                : 'bg-white/5 opacity-100 group-hover:bg-white/10'
            }`} />
            {selectedProject === null && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/50 to-purple-400/50 blur-md" />
              </div>
            )}
            <span className={`relative flex items-center gap-2 transition-colors ${
              selectedProject === null ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
            }`}>
              {selectedProject === null && (
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Auto
            </span>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Number Buttons */}
          {projects.map((project, index) => (
            <button
              key={index}
              onClick={() => goToProject(index)}
              className={`group relative h-10 w-10 overflow-hidden rounded-xl font-mono text-sm font-bold transition-all ${
                selectedProject === index ? 'scale-110' : 'scale-100 hover:scale-105'
              }`}
              title={project.title}
            >
              {/* Background */}
              <div className={`absolute inset-0 transition-all ${
                selectedProject === index
                  ? 'bg-gradient-to-br from-violet-600 to-purple-600 opacity-100'
                  : 'bg-white/5 opacity-100 group-hover:bg-white/10'
              }`} />
              
              {/* Glow effect for selected */}
              {selectedProject === index && (
                <div className="absolute inset-0">
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-violet-400/50 to-purple-400/50 blur-md" />
                </div>
              )}
              
              {/* Border */}
              <div className={`absolute inset-0 rounded-xl border transition-all ${
                selectedProject === index
                  ? 'border-violet-400/50'
                  : 'border-white/10 group-hover:border-white/20'
              }`} />
              
              {/* Number */}
              <span className={`relative transition-colors ${
                selectedProject === index
                  ? 'text-white'
                  : 'text-slate-400 group-hover:text-slate-300'
              }`}>
                {index + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Project Name Indicator */}
        {selectedProject !== null && (
          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-black/30 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-slate-300">
                {projects[selectedProject].title}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
