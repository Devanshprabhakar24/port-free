import { Canvas, useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { memo, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useTransitionStore } from '../../store/transitionStore'

interface TunnelSceneProps {
  cameraZRef: React.MutableRefObject<number>
}

function TunnelScene({ cameraZRef }: TunnelSceneProps) {
  const tunnelRef = useRef<THREE.Mesh>(null)

  const tunnelGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.1, 4, 20, 6, 1, true),
    [],
  )

  const tunnelMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#7c3aed'),
        wireframe: true,
        transparent: true,
        opacity: 1,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      tunnelGeometry.dispose()
      tunnelMaterial.dispose()
    }
  }, [tunnelGeometry, tunnelMaterial])

  useFrame(({ camera }, delta) => {
    camera.position.set(0, 0, cameraZRef.current)
    camera.lookAt(0, 0, -12)

    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += delta * 0.65
    }
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <mesh
        ref={tunnelRef}
        geometry={tunnelGeometry}
        material={tunnelMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -2]}
      />
    </>
  )
}

function TransitionTunnel() {
  const isMobile = useIsMobile()
  const reducedMotion = usePrefersReducedMotion()
  const isTransitionActive = useTransitionStore((state) => state.isTransitionActive)
  const runPeakAction = useTransitionStore((state) => state.runPeakAction)
  const endTransition = useTransitionStore((state) => state.endTransition)

  const cameraZRef = useRef(10)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isTransitionActive) {
      return
    }

    if (reducedMotion || isMobile) {
      void runPeakAction()
      endTransition()
      return
    }

    cameraZRef.current = 10
    if (overlayRef.current) {
      overlayRef.current.style.opacity = '0'
    }

    const tweenState = { z: 13 }
    const tl = gsap.timeline({
      defaults: { overwrite: true },
      onComplete: () => {
        endTransition()
      },
    })

    tl.to(
      tweenState,
      {
        z: -7,
        duration: 0.32,
        ease: 'power4.in',
        onUpdate: () => {
          cameraZRef.current = tweenState.z
        },
      },
      0,
    )

    tl.to(
      overlayRef.current,
      {
        opacity: 1,
        duration: 0.16,
        ease: 'power3.inOut',
      },
      0.2,
    )

    tl.add(() => {
      void runPeakAction()
    }, 0.3)

    tl.to(
      tweenState,
      {
        z: 13,
        duration: 0.26,
        ease: 'power4.out',
        onUpdate: () => {
          cameraZRef.current = tweenState.z
        },
      },
      0.3,
    )

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.24,
        ease: 'power3.out',
      },
      0.36,
    )

    return () => {
      tl.kill()
    }
  }, [endTransition, isMobile, isTransitionActive, reducedMotion, runPeakAction])

  if (!isTransitionActive || isMobile) {
    return null
  }

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 9999, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 70, near: 0.01, far: 100 }}
        dpr={[1, isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2)]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#07070d']} />
        <TunnelScene cameraZRef={cameraZRef} />
      </Canvas>

      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black"
        style={{ opacity: 0 }}
      />
    </div>
  )
}

export default memo(TransitionTunnel)
