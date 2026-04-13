import { useSpring, a } from '@react-spring/three'
import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { useIsMobile } from '../../hooks/useIsMobile'

type ProjectCard3DProps = {
  index?: number
  title: string
  stack: string
  summary: string
  position: [number, number, number]
  rotation: number
  url: string
  image?: string // Optional project image
}

export default function ProjectCard3D({
  index = 0,
  title,
  stack,
  summary,
  position,
  rotation,
  url,
  image,
}: ProjectCard3DProps) {
  const [hovered, setHovered] = useState(false)
  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null)
  const isMobile = useIsMobile()

  const { rotationY, scale } = useSpring({
    rotationY: hovered ? Math.PI : 0,
    scale: hovered ? 1.05 : 1,
    config: { tension: 200, friction: 20 },
  })

  // Bigger cards - increased from previous values
  const cardWidth = isMobile ? 3.2 : 4.2
  const cardHeight = isMobile ? 2 : 2.6

  // Load project image if provided
  useMemo(() => {
    if (image) {
      const loader = new THREE.TextureLoader()
      loader.load(
        image,
        (texture) => {
          setImageTexture(texture)
        },
        undefined,
        (error) => {
          console.warn(`Failed to load image: ${image}`, error)
        }
      )
    }
  }, [image])

  // Create back texture with full project screenshot
  const backTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    if (imageTexture) {
      // If we have an image, show full screenshot
      ctx.fillStyle = '#0a0a12'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the full project screenshot
      const img = imageTexture.image as HTMLImageElement
      const imgScale = Math.max(canvas.width / img.width, canvas.height / img.height)
      const x = (canvas.width - img.width * imgScale) / 2
      const y = (canvas.height - img.height * imgScale) / 2
      
      ctx.drawImage(img, x, y, img.width * imgScale, img.height * imgScale)

      // Add subtle overlay gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(10,10,18,0.2)')
      gradient.addColorStop(1, 'rgba(10,10,18,0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add project title at bottom
      ctx.fillStyle = 'rgba(0,0,0,0.8)'
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 48px "Cabinet Grotesk", sans-serif'
      ctx.fillText(title, 40, canvas.height - 50)
    } else {
      // Fallback: gradient background with project info
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#0f0f1e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 72px "Cabinet Grotesk", sans-serif'
      ctx.fillText(title, 80, 200)

      // Stack
      ctx.fillStyle = 'rgba(167,139,250,0.9)'
      ctx.font = '600 36px "Cabinet Grotesk", sans-serif'
      const stackParts = stack.split(',')
      let y = 280
      stackParts.forEach((part) => {
        ctx.fillText(`◆ ${part.trim()}`, 80, y)
        y += 50
      })

      // Summary
      ctx.fillStyle = 'rgba(148,163,184,0.9)'
      ctx.font = '500 28px "Cabinet Grotesk", sans-serif'
      const words = summary.split(' ')
      let line = ''
      y = 480
      const maxWidth = canvas.width - 160
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 80, y)
          line = words[i] + ' '
          y += 40
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 80, y)
    }

    const map = new THREE.CanvasTexture(canvas)
    map.needsUpdate = true
    return map
  }, [imageTexture, title, stack, summary])

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#7c3aed')
    gradient.addColorStop(1, '#ec4899')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Card background
    ctx.fillStyle = 'rgba(15,16,32,0.95)'
    ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80)

    // If image is loaded, draw it
    if (imageTexture) {
      const img = imageTexture.image as HTMLImageElement
      const imgWidth = 400
      const imgHeight = 250
      const imgX = 80
      const imgY = 100
      
      // Draw image with rounded corners effect
      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(imgX, imgY, imgWidth, imgHeight)
      ctx.globalAlpha = 0.9
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight)
      ctx.restore()
      
      // Image border
      ctx.strokeStyle = 'rgba(124,58,237,0.4)'
      ctx.lineWidth = 2
      ctx.strokeRect(imgX, imgY, imgWidth, imgHeight)
    }

    // Border
    ctx.strokeStyle = 'rgba(124,58,237,0.6)'
    ctx.lineWidth = 3
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Mission label
    ctx.fillStyle = 'rgba(167,139,250,0.9)'
    ctx.font = '600 20px "Cabinet Grotesk", sans-serif'
    ctx.fillText(`MISSION ${String(index + 1).padStart(2, '0')}`, 80, 80)

    // Title - position based on whether image exists
    const titleY = imageTexture ? 390 : 180
    ctx.fillStyle = '#ffffff'
    ctx.font = imageTexture ? '700 48px "Cabinet Grotesk", sans-serif' : '700 64px "Cabinet Grotesk", sans-serif'
    ctx.fillText(title, imageTexture ? 520 : 80, titleY)

    // Stack
    const stackY = imageTexture ? 450 : 260
    ctx.fillStyle = 'rgba(248,250,252,0.9)'
    ctx.font = imageTexture ? '600 24px "Cabinet Grotesk", sans-serif' : '600 32px "Cabinet Grotesk", sans-serif'
    const prefixedStack = stack
      .split(',')
      .map((item) => `◆ ${item.trim()}`)
      .join('   ')
    
    // Wrap stack text if too long
    const maxStackWidth = imageTexture ? 420 : canvas.width - 160
    const stackX = imageTexture ? 520 : 80
    if (ctx.measureText(prefixedStack).width > maxStackWidth) {
      const stackParts = stack.split(',')
      let currentY = stackY
      stackParts.forEach((part) => {
        ctx.fillText(`◆ ${part.trim()}`, stackX, currentY)
        currentY += 32
      })
    } else {
      ctx.fillText(prefixedStack, stackX, stackY)
    }

    // Summary (wrapped) - only if no image or below image
    if (!imageTexture) {
      ctx.fillStyle = 'rgba(148,163,184,0.95)'
      ctx.font = '500 26px "Cabinet Grotesk", sans-serif'
      const words = summary.split(' ')
      let line = ''
      let y = 360
      const maxWidth = canvas.width - 160
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 80, y)
          line = words[i] + ' '
          y += 36
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 80, y)
    }

    const map = new THREE.CanvasTexture(canvas)
    map.needsUpdate = true
    return map
  }, [title, stack, summary, index, imageTexture])

  return (
    <group position={position} rotation-y={rotation}>
      <a.group
        rotation-y={rotationY}
        scale={scale}
        onPointerOver={() => !isMobile && setHovered(true)}
        onPointerOut={() => !isMobile && setHovered(false)}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        onPointerDown={(e) => {
          // Enable click on mobile
          if (isMobile) {
            e.stopPropagation()
          }
        }}
      >
        {/* Front face with texture */}
        <mesh>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.3}
            metalness={0.2}
            emissive="#1a0a2e"
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </mesh>

        {/* Glow border */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[cardWidth + 0.12, cardHeight + 0.12]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={hovered ? 0.4 : 0.2} />
        </mesh>

        {/* Back face - Full project screenshot */}
        <mesh rotation-y={Math.PI} position={[0, 0, -0.01]}>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshStandardMaterial 
            map={backTexture} 
            roughness={0.4} 
            metalness={0.1}
            emissive="#1a0a2e" 
            emissiveIntensity={0.1}
          />
        </mesh>
      </a.group>
    </group>
  )
}
