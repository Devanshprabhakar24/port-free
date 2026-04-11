import { memo } from 'react'
import AboutSection from '../components/About/About'
import { useMousePosition } from '../hooks/useMousePosition'

function About() {
  const mouse = useMousePosition()
  // ⚡ NOTE: mouse prop is passed but About component has '_mouse' param
  // This is intentional to avoid triggering re-renders on mouse position change
  return <AboutSection mouse={mouse} />
}

export default memo(About)