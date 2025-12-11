import { create } from 'zustand'
import { generateImage, base64ToDataUrl } from '../services/ai/imageGeneration'

interface GeneratedImage {
  id: string
  dataUrl: string
  prompt: string
  createdAt: number
}

interface AIStore {
  // State
  isGenerating: boolean
  generatedImages: GeneratedImage[]
  error: string | null
  currentPrompt: string

  // Actions
  setCurrentPrompt: (prompt: string) => void
  generateImage: (prompt: string, negativePrompt?: string) => Promise<string>
  clearError: () => void
  clearHistory: () => void
}

export const useAIStore = create<AIStore>((set) => ({
  // Initial state
  isGenerating: false,
  generatedImages: [],
  error: null,
  currentPrompt: '',

  // Set current prompt
  setCurrentPrompt: (prompt: string) => {
    set({ currentPrompt: prompt })
  },

  // Generate image
  generateImage: async (prompt: string, negativePrompt?: string) => {
    set({ isGenerating: true, error: null })

    try {
      // Call AI service
      const result = await generateImage({ prompt, negativePrompt })

      // Convert to data URL
      const dataUrl = base64ToDataUrl(result.base64, result.mimeType)

      // Create image record
      const image: GeneratedImage = {
        id: `img-${Date.now()}`,
        dataUrl,
        prompt,
        createdAt: Date.now(),
      }

      // Update store
      set((state) => ({
        generatedImages: [image, ...state.generatedImages],
        isGenerating: false,
      }))

      return dataUrl
    } catch (error) {
      console.error('Image generation error:', error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      set({
        error: errorMessage,
        isGenerating: false,
      })

      throw error
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Clear history
  clearHistory: () => {
    set({ generatedImages: [] })
  },
}))
