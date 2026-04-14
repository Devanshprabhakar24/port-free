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
  details?: string[] // Detailed explanation array
  isSelected?: boolean
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
  details = [],
  isSelected = false,
}: ProjectCard3DProps) {
  const [hovered, setHovered] = useState(false)
  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null)
  const isMobile = useIsMobile()

  // Make the card pop out by updating its local Z position
  const { rotationY, scale, positionZ } = useSpring({
    rotationY: hovered ? Math.PI : 0,
    scale: isSelected ? 1.2 : hovered ? 1.05 : 1,
    positionZ: isSelected ? 2.5 : 0,
    config: { tension: 200, friction: 20 },
  })

  // Bigger cards
  const cardWidth = isMobile ? 3.8 : 5.5
  const cardHeight = isMobile ? 2.4 : 3.5

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
    const W = 1024
    const H = 640
    // Double the resolution for sharpness
    canvas.width = W * 2
    canvas.height = H * 2
    const ctx = canvas.getContext('2d')

    if (!ctx) return null
    ctx.scale(2, 2)

    if (imageTexture) {
      // If we have an image, show full screenshot
      ctx.fillStyle = '#0a0a12'
      ctx.fillRect(0, 0, W, H)

      // Draw the full project screenshot
      const img = imageTexture.image as HTMLImageElement
      const imgScale = Math.max(W / img.width, H / img.height)
      const x = (W - img.width * imgScale) / 2
      const y = (H - img.height * imgScale) / 2
      
      ctx.drawImage(img, x, y, img.width * imgScale, img.height * imgScale)

      // Add subtle overlay gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, H)
      gradient.addColorStop(0, 'rgba(10,10,18,0.2)')
      gradient.addColorStop(1, 'rgba(10,10,18,0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, W, H)

      // Add project title at bottom
      ctx.fillStyle = 'rgba(0,0,0,0.8)'
      ctx.fillRect(0, H - 100, W, 100)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = '700 48px "Cabinet Grotesk", sans-serif'
      ctx.fillText(title, 40, H - 50)
    } else {
      // Fallback: gradient background with project info
      const gradient = ctx.createLinearGradient(0, 0, W, H)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#0f0f1e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, W, H)

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
      const maxWidth = W - 160
      
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
    const W = 1024
    const H = 640
    // Double resolution for sharp text
    canvas.width = W * 2
    canvas.height = H * 2
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return null
    }

    ctx.scale(2, 2)

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, W, H)
    gradient.addColorStop(0, '#7c3aed')
    gradient.addColorStop(1, '#ec4899')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, W, H)

    // Card background
    ctx.fillStyle = 'rgba(15,16,32,0.95)'
    ctx.fillRect(40, 40, W - 80, H - 80)

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
    ctx.strokeRect(40, 40, W - 80, H - 80)

    // Mission label
    ctx.fillStyle = 'rgba(167,139,250,0.9)'
    ctx.font = '600 20px "Cabinet Grotesk", sans-serif'
    ctx.fillText(`MISSION ${String(index + 1).padStart(2, '0')}`, 80, 80)

    // Title - position based on whether image exists
    const titleY = imageTexture ? 150 : 180
    ctx.fillStyle = '#ffffff'
    ctx.font = imageTexture ? '700 48px "Cabinet Grotesk", sans-serif' : '700 64px "Cabinet Grotesk", sans-serif'
    ctx.fillText(title, imageTexture ? 520 : 80, titleY)

    // Stack
    const stackY = imageTexture ? 210 : 260
    ctx.fillStyle = 'rgba(248,250,252,0.9)'
    ctx.font = imageTexture ? '600 22px "Cabinet Grotesk", sans-serif' : '600 32px "Cabinet Grotesk", sans-serif'
    const prefixedStack = stack
      .split(',')
      .map((item) => `◆ ${item.trim()}`)
      .join('   ')
    
    // Wrap stack text if too long
    const maxStackWidth = imageTexture ? 440 : W - 160
    const stackX = imageTexture ? 520 : 80
    let currentStackY = stackY
    if (ctx.measureText(prefixedStack).width > maxStackWidth) {
      const stackParts = stack.split(',')
      stackParts.forEach((part) => {
        ctx.fillText(`◆ ${part.trim()}`, stackX, currentStackY)
        currentStackY += 32
      })
    } else {
      ctx.fillText(prefixedStack, stackX, currentStackY)
      currentStackY += 32
    }

    // Summary (wrapped) - Always drawn now
    ctx.fillStyle = 'rgba(148,163,184,0.95)'
    ctx.font = imageTexture ? '500 22px "Cabinet Grotesk", sans-serif' : '500 26px "Cabinet Grotesk", sans-serif'
    const words = summary.split(' ')
    let line = ''
    let y = imageTexture ? currentStackY + 20 : 360
    const maxWidth = imageTexture ? 440 : W - 160
    const summaryX = imageTexture ? 520 : 80
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, summaryX, y)
        line = words[i] + ' '
        y += imageTexture ? 30 : 36
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, summaryX, y)

    // If image exists, draw the detailed bullet points below the image and summary
    if (imageTexture && details.length > 0) {
      y = Math.max(y + 35, 400) // Ensure details are below the image
      ctx.fillStyle = 'rgba(235,235,245,0.95)'
      ctx.font = '500 20px "Cabinet Grotesk", sans-serif'
      
      details.forEach(detail => {
        const detailWords = detail.split(' ')
        let dLine = '• '
        for (let i = 0; i < detailWords.length; i++) {
          const testLine = dLine + detailWords[i] + ' '
          const metrics = ctx.measureText(testLine)
          if (metrics.width > (W - 160) && i > 0) {
            ctx.fillText(dLine, 80, y)
            dLine = '  ' + detailWords[i] + ' '
            y += 28
          } else {
            dLine = testLine
          }
        }
        ctx.fillText(dLine, 80, y)
        y += 35
      })
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
        // Safely interpolate position z for react-spring
        position={positionZ.to((z) => [0, 0, z] as unknown as [number, number, number])}
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
