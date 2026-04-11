import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 3200

export default function Stars() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const positions = useMemo(() => {
    const list: THREE.Vector3[] = []
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const radius = 8 + (i % 120) * 0.05
      const angle = i * 0.17
      const y = ((i % 200) - 100) * 0.03
      list.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius,
        ),
      )
    }
    return list
  }, [])

  useEffect(() => {
    if (!meshRef.current) {
      return
    }

    const dummy = new THREE.Object3D()
    positions.forEach((point, index) => {
      dummy.position.copy(point)
      const scale = 0.01 + (index % 10) * 0.002
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(index, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.11) * 0.06
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STAR_COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color="#e2e8f0" transparent opacity={0.85} />
    </instancedMesh>
  )
}
