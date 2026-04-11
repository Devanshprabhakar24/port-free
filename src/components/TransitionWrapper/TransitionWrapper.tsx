import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

function TransitionWrapper() {
  const location = useLocation()

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4, scale: 0.998 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 1.002 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 min-h-screen will-change-transform"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

export default memo(TransitionWrapper)