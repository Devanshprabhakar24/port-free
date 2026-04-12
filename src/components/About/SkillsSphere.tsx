import { Html, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

type SkillsSphereProps = {
  label: string
  angle: number
  radius: number
  speed: number
  mouseX: number
  mouseY: number
}

export default function SkillsSphere({
  label,
  angle,
  radius,
  speed,
  mouseX,
  mouseY,
}: SkillsSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return
    }

    const t = clock.getElapsedTime() * speed + angle
    const base = new THREE.Vector3(Math.cos(t) * radius, Math.sin(t * 1.2) * 0.65, Math.sin(t) * radius)

    const pointer = new THREE.Vector3(mouseX * 2.4, mouseY * 1.6, 0)
    const distance = base.distanceTo(pointer)
    const influence = THREE.MathUtils.clamp(1.8 - distance, -0.7, 0.7)

    base.x += (base.x - pointer.x) * influence * 0.08
    base.y += (base.y - pointer.y) * influence * 0.08

    meshRef.current.position.lerp(base, 0.08)
    const targetScale = hovered ? 1.35 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.14)
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.24, 24, 24]} />
      <meshStandardMaterial color={hovered ? '#ec4899' : '#7c3aed'} roughness={0.22} metalness={0.6} />
      <Text
        position={[0, 0, 0.26]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      {hovered ? (
        <Html distanceFactor={10} center>
          <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-white">{label}</div>
        </Html>
      ) : null}
    </mesh>
  )
}
