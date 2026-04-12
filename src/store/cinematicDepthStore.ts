import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { SectionId } from './scrollSectionStore'

export type DepthMap = Record<SectionId, number>

type CinematicDepthState = {
  depths: DepthMap
  setDepth: (id: SectionId, value: number) => void
  setDepths: (map: DepthMap) => void
}

const DEFAULT_DEPTHS: DepthMap = {
  hero: 1,
  about: 0,
  projects: 0,
  contact: 0,
}

export const useCinematicDepthStore = create<CinematicDepthState>()(
  subscribeWithSelector((set, get) => ({
    depths: DEFAULT_DEPTHS,
    setDepth: (id, value) => {
      const clamped = Math.max(0, Math.min(1, value))
      const current = get().depths[id]
      if (Math.abs(current - clamped) < 0.0005) {
        return
      }

      set((state) => ({
        depths: {
          ...state.depths,
          [id]: clamped,
        },
      }))
    },
    setDepths: (map) => {
      set({ depths: map })
    },
  })),
)
