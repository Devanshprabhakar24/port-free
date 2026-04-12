import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function TerrainBackground() {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(15, 10, 80, 80)
    geo.rotateX(-Math.PI / 2.8)
    return geo
  }, [])

  useEffect(() => {
    return () => {
      geometry.dispose()
      const material = meshRef.current?.material
      if (material instanceof THREE.Material) {
        material.dispose()
      }
    }
  }, [geometry])

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return
    }

    const t = clock.getElapsedTime()
    const targetGeometry = meshRef.current.geometry as THREE.PlaneGeometry

    if (!targetGeometry) {
      return
    }

    const position = targetGeometry.attributes.position

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i)
      const z = position.getZ(i)
      const y = Math.sin(x * 0.8 + t * 0.9) * 0.1 + Math.cos(z * 0.7 + t * 1.1) * 0.1
      position.setY(i, y)
    }

    position.needsUpdate = true
    targetGeometry.computeVertexNormals()
    meshRef.current.rotation.y = Math.sin(t * 0.15) * 0.12
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -2.1, -2]}>
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#312e81"
        emissiveIntensity={0.42}
        wireframe
        opacity={0.34}
        transparent
      />
    </mesh>
  )
}
