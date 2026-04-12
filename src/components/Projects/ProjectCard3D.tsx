import { Text } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three'
import { useMemo, useState } from 'react'
import * as THREE from 'three'

type ProjectCard3DProps = {
  index?: number
  title: string
  stack: string
  summary: string
  position: [number, number, number]
  url: string
}

export default function ProjectCard3D({
  index = 0,
  title,
  stack,
  summary,
  position,
  url,
}: ProjectCard3DProps) {
  const [hovered, setHovered] = useState(false)

  const { rotationY } = useSpring({
    rotationY: hovered ? Math.PI : 0,
    config: { tension: 200, friction: 20 },
  })

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#7c3aed')
    gradient.addColorStop(1, '#ec4899')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'rgba(255,255,255,0.24)'
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100)

    ctx.strokeStyle = 'rgba(255,255,255,0.42)'
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

    ctx.fillStyle = '#ffffff'
    ctx.font = '700 58px "Cabinet Grotesk", sans-serif'
    ctx.fillText(title, 90, 210)
    ctx.fillStyle = 'rgba(167,139,250,0.95)'
    ctx.font = '600 22px "Cabinet Grotesk", sans-serif'
    ctx.fillText(`MISSION ${String(index + 1).padStart(2, '0')}`, 90, 120)
    ctx.font = '600 34px "Cabinet Grotesk", sans-serif'
    ctx.fillStyle = 'rgba(248,250,252,0.95)'
    const prefixedStack = stack
      .split(',')
      .map((item) => `◆ ${item.trim()}`)
      .join('   ')
    ctx.fillText(prefixedStack, 90, 285)

    const map = new THREE.CanvasTexture(canvas)
    map.needsUpdate = true
    return map
  }, [title, stack])

  return (
    <a.group
      position={position}
      rotation-y={rotationY}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
    >
      <mesh>
        <planeGeometry args={[2.4, 1.45]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.22}
          metalness={0.18}
          emissive="#27114a"
          emissiveIntensity={hovered ? 0.34 : 0.22}
        />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.46, 1.51]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={hovered ? 0.24 : 0.14} />
      </mesh>

      <mesh rotation-y={Math.PI} position={[0, 0, -0.02]}>
        <planeGeometry args={[2.4, 1.45]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.1} />
      </mesh>

      <Text position={[0, 0.18, -0.01]} rotation-y={Math.PI} fontSize={0.1} color="#f8fafc" maxWidth={2} anchorX="center">
        {title}
      </Text>
      <Text position={[0, -0.08, -0.01]} rotation-y={Math.PI} fontSize={0.065} color="#94a3b8" maxWidth={1.8} anchorX="center">
        {summary}
      </Text>
    </a.group>
  )
}
