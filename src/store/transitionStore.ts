import { create } from 'zustand'

export type TransitionPeakAction = (() => void | Promise<void>) | undefined

export interface TransitionState {
  isTransitionActive: boolean
  peakAction?: () => void | Promise<void>
  triggerTransition: (action?: TransitionPeakAction) => void
  runPeakAction: () => Promise<void>
  endTransition: () => void
}

export const useTransitionStore = create<TransitionState>((set, get) => ({
  isTransitionActive: false,
  peakAction: undefined,

  triggerTransition: (action) => {
    const { isTransitionActive } = get()
    if (isTransitionActive) {
      return
    }

    set({
      isTransitionActive: true,
      peakAction: action,
    })
  },

  runPeakAction: async () => {
    const action = get().peakAction
    if (!action) {
      return
    }

    await Promise.resolve(action())
    set({ peakAction: undefined })
  },

  endTransition: () => {
    set({
      isTransitionActive: false,
      peakAction: undefined,
    })
  },
}))
