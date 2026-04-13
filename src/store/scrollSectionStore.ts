import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type SectionId = 'hero' | 'about' | 'services' | 'projects' | 'contact'
export type VelocityBand = 'slow' | 'medium' | 'fast'
export type ScrollDirection = 'down' | 'up'

const SECTION_ORDER: SectionId[] = ['hero', 'about', 'services', 'projects', 'contact']

type ScrollSectionState = {
  currentSection: SectionId
  previousSection: SectionId
  velocityBand: VelocityBand
  scrollDirection: ScrollDirection
  setSection: (section: SectionId) => void
  setVelocityBand: (band: VelocityBand) => void
}

export const useScrollSectionStore = create<ScrollSectionState>()(
  subscribeWithSelector((set, get) => ({
    currentSection: 'hero',
    previousSection: 'hero',
    velocityBand: 'medium',
    scrollDirection: 'down',

    setSection: (section) => {
      const { currentSection } = get()
      if (section === currentSection) return

      const currentIndex = SECTION_ORDER.indexOf(currentSection)
      const nextIndex = SECTION_ORDER.indexOf(section)
      const scrollDirection: ScrollDirection = nextIndex > currentIndex ? 'down' : 'up'

      set({
        previousSection: currentSection,
        currentSection: section,
        scrollDirection,
      })
    },

    setVelocityBand: (band) => {
      if (get().velocityBand === band) return
      set({ velocityBand: band })
    },
  })),
)
