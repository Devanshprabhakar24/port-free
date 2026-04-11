import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero/Hero'
import { useMousePosition } from '../hooks/useMousePosition'

function Home() {
  const mouse = useMousePosition()
  const navigate = useNavigate()

  // ⚡ OPTIMIZATION: Memoize callbacks to prevent unnecessary re-renders
  const onViewProjects = useMemo(() => () => navigate('/projects'), [navigate])
  const onHireMe = useMemo(() => () => navigate('/contact'), [navigate])

  return (
    <Hero
      mouse={mouse}
      onViewProjects={onViewProjects}
      onHireMe={onHireMe}
    />
  )
}

export default memo(Home)