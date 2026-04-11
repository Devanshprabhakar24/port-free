import { memo } from 'react'
import ContactSection from '../components/Contact/Contact'
import { useMousePosition } from '../hooks/useMousePosition'

function Contact() {
  const mouse = useMousePosition()
  return <ContactSection mouse={mouse} />
}

export default memo(Contact)