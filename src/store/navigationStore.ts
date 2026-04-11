import { create } from 'zustand'

type NavigationState = {
  activePath: string
  previousPath: string | null
  previewPath: string | null
  commitPath: (nextPath: string) => void
  setPreviewPath: (path: string | null) => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  activePath: '/',
  previousPath: null,
  previewPath: null,

  commitPath: (nextPath) => {
    const current = get().activePath
    if (current === nextPath) {
      return
    }

    set({
      previousPath: current,
      activePath: nextPath,
      previewPath: null,
    })
  },

  setPreviewPath: (path) => {
    const { activePath } = get()
    set({ previewPath: path === activePath ? null : path })
  },
}))
