import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Keyword {
  id: string
  keyword: string
  intent: string
  relevanceScore: number
  suggestedVolume?: string
}

interface Project {
  id: string
  name: string
  coreKeywords: string[]
  language: string
  country: string
}

interface KeywordStore {
  selectedKeywords: Keyword[]
  currentProject: Project | null
  addKeyword: (keyword: Keyword) => void
  removeKeyword: (id: string) => void
  setProject: (project: Project) => void
  clearSelection: () => void
  toggleKeyword: (keyword: Keyword) => void
}

export const useKeywordStore = create<KeywordStore>()(
  persist(
    (set) => ({
      selectedKeywords: [],
      currentProject: null,
      addKeyword: (keyword) =>
        set((state) => ({
          selectedKeywords: [...state.selectedKeywords, keyword],
        })),
      removeKeyword: (id) =>
        set((state) => ({
          selectedKeywords: state.selectedKeywords.filter((k) => k.id !== id),
        })),
      setProject: (project) => set({ currentProject: project }),
      clearSelection: () => set({ selectedKeywords: [] }),
      toggleKeyword: (keyword) =>
        set((state) => {
          const exists = state.selectedKeywords.find((k) => k.id === keyword.id)
          if (exists) {
            return {
              selectedKeywords: state.selectedKeywords.filter((k) => k.id !== keyword.id),
            }
          } else {
            return {
              selectedKeywords: [...state.selectedKeywords, keyword],
            }
          }
        }),
    }),
    {
      name: 'keyword-storage',
    }
  )
)
