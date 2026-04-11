import { memo } from 'react'
import ProjectsSection from '../components/Projects/Projects'
import { useMousePosition } from '../hooks/useMousePosition'

function Projects() {
  const mouse = useMousePosition()
  return <ProjectsSection mouse={mouse} />
}

export default memo(Projects)