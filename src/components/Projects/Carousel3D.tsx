import { PresentationControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
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
    title: 'WombTo18',
    stack: 'Node.js, Razorpay, DAG Engine',
    summary: 'Health-tech platform tracking child vaccination schedules, growth milestones, and doctor visits for 50K+ parents.',
    url: 'https://child-module.vercel.app',
    image: '/projects/wombto18.png',
    details: [
      'The Problem: Managing vaccination schedules and growth milestones for thousands of children is incredibly complex and prone to human error.',
      'The Solution: Engineered an intelligent scheduling engine that strictly follows WHO guidelines, paired with a secure medical booking system.',
      'The Result: A highly secure, automated tracking system actively used by 50,000+ parents to monitor child health without the guesswork.'
    ]
  },
  {
    title: 'Scatch',
    stack: 'Node.js, MongoDB, React',
    summary: 'Custom e-commerce store with product catalog, cart, secure checkout, and user authentication.',
    url: 'https://scatch-xi.vercel.app/',
    image: '/projects/scatch.svg',
    details: [
      'The Problem: Generic storefronts limit business customization and struggle with scalable payment pipelines.',
      'The Solution: Built a custom full-stack e-commerce architecture with secure Stripe payment processing and dynamic product filtering.',
      'The Result: A premium shopping experience with real-time cart state management and automated order tracking workflows.'
    ]
  },
  {
    title: 'MyLaundry',
    stack: 'React, Node.js, MongoDB',
    summary: 'Business management portal with real-time order tracking, admin dashboard, and customer integration.',
    url: 'https://my-laundry-lime.vercel.app/',
    image: '/projects/mylaundry.svg',
    details: [
      'The Problem: Local laundry businesses lose time manually tracking customer orders, deliveries, and notifications.',
      'The Solution: Developed a comprehensive admin dashboard and customer portal linked to automated SMS/email gateways.',
      'The Result: Completely automated manual tracking, significantly improving order completion times and management visibility.'
    ]
  },
  {
    title: 'ZTUBE',
    stack: 'TypeScript, Next.js, PostgreSQL',
    summary: 'A scalable video platform with user auth, cloud uploads, streaming, and subscription system.',
    url: 'https://ztube.vercel.app/home',
    image: '/projects/ztube.svg',
    details: [
      'The Problem: Traditional video hosting platforms restrict creator monetization and control over data.',
      'The Solution: Built a highly scalable video-streaming backend with chunked media uploads for large files and robust caching.',
      'The Result: A dynamic, high-performance content engine capable of handling parallel video streams and custom subscriptions.'
    ]
  },
]

function CardRing({ targetRotation, isManual, selectedProject, onDisplayProject }: { targetRotation: number; isManual: boolean; selectedProject: number | null; onDisplayProject: (index: number) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  const autoRotationRef = useRef(0)

  const positions = useMemo(() => {
    // Perfect numerical circle based on device
    const radius = isMobile ? 5 : 7.2
    
    return projects.map((_, index) => {
      const theta = (Math.PI * 2 * index) / projects.length
      const cardAngle = theta + Math.PI / 2
      return {
        position: [Math.cos(cardAngle) * radius, 0, Math.sin(cardAngle) * radius] as [number, number, number],
        rotation: -theta, // Rotate card to directly face the camera when centered
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
      
      // Calculate which project is at the front and notify parent
      const theta = groupRef.current.rotation.y % (Math.PI * 2);
      const projectCount = projects.length;
      let minDiff = Infinity;
      let minIndex = 0;
      for (let i = 0; i < projectCount; i++) {
        const projTheta = (Math.PI * 2 * i) / projectCount;
        const diff = Math.abs(Math.atan2(Math.sin(theta - projTheta), Math.cos(theta - projTheta)));
        if (diff < minDiff) {
          minDiff = diff;
          minIndex = i;
        }
      }
      onDisplayProject(minIndex);
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
  const [autoRotation, setAutoRotation] = useState(0)
  const [displayProjectIndex, setDisplayProjectIndex] = useState(0)

  // Track auto-rotation for AUTO mode
  useEffect(() => {
    let frameId: number;
    function update() {
      setAutoRotation(() => {
        const speed = isMobile ? 0.08 : 0.12;
        return ((performance.now() / 1000) * speed) % (Math.PI * 2);
      });
      frameId = requestAnimationFrame(update);
    }
    update();
    return () => cancelAnimationFrame(frameId);
  }, [isMobile]);

  const handleDisplayProject = useCallback((index: number) => {
    // Only update from CardRing when in AUTO mode
    // When a button is selected, the parent directly sets displayProjectIndex
    if (selectedProject === null) {
      setDisplayProjectIndex(index);
    }
  }, [selectedProject]);

  const goToProject = (index: number) => {
    setSelectedProject(index)
    setDisplayProjectIndex(index) // Show immediately, don't wait for animation
    // Calculate rotation to show selected project at front
    const rotation = (Math.PI * 2 * index) / projects.length
    setTargetRotation(rotation)
  }

  const resetToAuto = () => {
    setSelectedProject(null)
  }

  // Determine which project to display
  let displayIndex = displayProjectIndex;
  
  return (
    <div className="flex w-full flex-col h-auto min-h-full">
      {/* 3D Viewport Space - Condensed Height to make it specifically smaller */}
      <div className="relative h-[350px] md:h-[400px] w-full shrink-0">
        <Canvas
          camera={{ 
            position: [0, 0, isMobile ? 11 : 14], 
            fov: isMobile ? 60 : 60 
          }}
          dpr={[1, isMobile ? 1.5 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
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
          
          <CardRing targetRotation={targetRotation} isManual={selectedProject !== null} selectedProject={selectedProject} onDisplayProject={handleDisplayProject} />
        </Canvas>

        {/* Project Selection Buttons - Attached cleanly inside the bottom rim of 3D frame */}
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
        </div>
      </div>

      {/* Project Details Panel - Always shows the visually centered project */}
      <div className="w-full shrink-0 border-t border-white/5 bg-[#0a0a12]/80 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {displayIndex !== null ? (
            <motion.div
              key={displayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mx-auto max-w-6xl p-6 md:p-10"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <div className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                    <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                    Mission {String(displayIndex + 1).padStart(2, '0')}
                  </div>
                  
                  <h3 className="mb-4 font-display text-3xl font-bold text-white md:text-4xl">
                    {projects[displayIndex].title}
                  </h3>
                  
                  <div className="mb-6 flex flex-wrap gap-2">
                    {projects[displayIndex].stack.split(',').map((tech, i) => (
                      <span key={i} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={projects[displayIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/40 bg-violet-500/20 px-5 py-3.5 text-base font-semibold text-white transition-all hover:bg-violet-500/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] md:w-auto"
                  >
                    Visit Live Demo
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="md:w-2/3 md:border-l md:border-white/10 md:pl-8">
                  <p className="mb-6 text-lg leading-relaxed text-slate-300">
                    {projects[displayIndex].summary}
                  </p>
                  
                  <div className="space-y-4">
                    {projects[displayIndex].details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/80" />
                        <p className="text-base leading-relaxed text-slate-400">
                          {detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16 text-slate-500"
            >
              <div className="flex flex-col items-center gap-4">
                <svg className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p>Select a project from the 3D module to view comprehensive details.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
