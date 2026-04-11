import { create } from 'zustand'

export type SectionId = 'hero' | 'about' | 'projects' | 'contact'
export type VelocityBand = 'slow' | 'medium' | 'fast'

type ScrollSectionState = {
  currentSection: SectionId
  previousSection: SectionId
  velocityBand: VelocityBand
  setSection: (section: SectionId) => void
  setVelocityBand: (band: VelocityBand) => void
}

export const useScrollSectionStore = create<ScrollSectionState>((set, get) => ({
  currentSection: 'hero',
  previousSection: 'hero',
  velocityBand: 'medium',

  setSection: (section) => {
    const { currentSection } = get()
    if (section === currentSection) {
      return
    }

    set({
      previousSection: currentSection,
      currentSection: section,
    })
  },

  setVelocityBand: (band) => {
    const { velocityBand } = get()
    if (velocityBand === band) {
      return
    }
    set({ velocityBand: band })
  },
}))
