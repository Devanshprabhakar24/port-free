import { PresentationControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { AnimatePresence, motion } from 'framer-motion'
import ProjectCard3D from './ProjectCard3D'
import { useIsMobile } from '../../hooks/useIsMobile'

type Project = {
  title: string
  stack: string
  summary: string
  url: string
  image?: string // Optional project screenshot/image
  details: string[]
}

const projects: Project[] = [
  {
    title: 'ZTUBE',
    stack: 'TypeScript, Next.js, PostgreSQL',
    summary: 'A YouTube-like video platform with user auth, cloud uploads, streaming, and subscription system.',
    url: 'https://ztube.vercel.app/home',
    image: '/projects/ztube.svg',
    details: [
      'Built a highly scalable video-streaming backend with chunked media uploads for large files.',
      'Implemented secure JWT-based authentication and role-based access control.',
      'Designed a custom subscription, like/dislike, and personalized watch-history system.'
    ]
  },
  {
    title: 'Scatch',
    stack: 'Node.js, MongoDB, JWT',
    summary: 'Full e-commerce store with product catalog, cart, secure checkout, and JWT-based authentication.',
    url: 'https://scatch-xi.vercel.app/',
    image: '/projects/scatch.svg',
    details: [
      'Built a full-stack e-commerce architecture with secure Stripe payment processing.',
      'Created a robust product catalog system with dynamic filtering, fast searching, and categories.',
      'Implemented real-time cart state management and automated order tracking workflows.'
    ]
  },
  {
    title: 'MyLaundry',
    stack: 'React, Node.js, MongoDB',
    summary: 'Business management app with real-time order tracking, admin dashboard, and customer portal.',
    url: 'https://my-laundry-lime.vercel.app/',
    image: '/projects/mylaundry.svg',
    details: [
      'Developed a comprehensive admin dashboard for monitoring laundry orders and delivery status.',
      'Created a seamless customer-facing portal for seamless order booking and tracking.',
      'Integrated automated SMS and Email notification services for real-time order updates.'
    ]
  },
  {
    title: 'WombTo18',
    stack: 'Node.js, Razorpay, DAG Engine',
    summary: 'Health-tech platform tracking child vaccination schedules, growth milestones, and doctor visits for 50K+ parents.',
    url: 'https://child-module.vercel.app',
    image: '/projects/wombto18.png',
    details: [
      'Engineered a complex DAG-based vaccination schedule engine strictly following WHO guidelines.',
      'Integrated Razorpay for seamless appointment and medical consultation bookings.',
      'Designed highly secure medical records and physical growth tracking system used by 50,000+ parents.'
    ]
  },
]

function CardRing({ targetRotation, isManual, selectedProject }: { targetRotation: number; isManual: boolean; selectedProject: number | null }) {
  const groupRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  const autoRotationRef = useRef(0)

  const positions = useMemo(() => {
    // Bigger ring on desktop, and larger on mobile too
    const radius = isMobile ? 4.2 : 6.8
    const depth = isMobile ? 2.5 : 4
    
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
            details={project.details}
            position={positions[index].position}
            rotation={positions[index].rotation}
            isSelected={selectedProject === index}
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
          position: [0, 0, isMobile ? 9 : 12], 
          fov: isMobile ? 55 : 55 
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
        
        <CardRing targetRotation={targetRotation} isManual={selectedProject !== null} selectedProject={selectedProject} />
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

        {/* Project Details Panel Overlay */}
        <AnimatePresence>
          {selectedProject !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`absolute z-30 ${isMobile ? 'top-4 left-4 right-4' : 'top-8 left-8 w-[380px]'} overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur-xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
              
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-violet-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                  Mission {String(selectedProject + 1).padStart(2, '0')}
                </div>
                
                <h3 className="mb-1.5 font-display text-2xl font-bold text-white">
                  {projects[selectedProject].title}
                </h3>
                
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {projects[selectedProject].stack.split(',').map((tech, i) => (
                    <span key={i} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
                
                <div className="mb-4 space-y-2 border-l-2 border-violet-500/40 pl-3">
                  {projects[selectedProject].details.map((detail, i) => (
                    <p key={i} className="text-[13px] leading-[1.6] text-slate-300">
                      {detail}
                    </p>
                  ))}
                </div>
                
                <a
                  href={projects[selectedProject].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/20 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  Visit Live Demo
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
