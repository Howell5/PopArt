import { create } from 'zustand'
import {
  generateImage,
  base64ToDataUrl,
  IMAGE_MODELS,
  DEFAULT_MODEL,
  type ImageModel,
} from '../services/ai/imageGeneration'

interface GeneratedImage {
  id: string
  dataUrl: string
  prompt: string
  modelId: string
  createdAt: number
}

interface AIStore {
  // State
  isGenerating: boolean
  generatedImages: GeneratedImage[]
  error: string | null
  currentPrompt: string
  currentModel: ImageModel

  // Actions
  setCurrentPrompt: (prompt: string) => void
  setCurrentModel: (model: ImageModel) => void
  generateImage: (prompt: string, options?: { negativePrompt?: string; referenceImages?: string[] }) => Promise<string>
  clearError: () => void
  clearHistory: () => void
}

// Export for convenience
export { IMAGE_MODELS, DEFAULT_MODEL, type ImageModel }

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial state
  isGenerating: false,
  generatedImages: [],
  error: null,
  currentPrompt: '',
  currentModel: DEFAULT_MODEL,

  // Set current prompt
  setCurrentPrompt: (prompt: string) => {
    set({ currentPrompt: prompt })
  },

  // Set current model
  setCurrentModel: (model: ImageModel) => {
    set({ currentModel: model })
  },

  // Generate image
  generateImage: async (prompt: string, options?: { negativePrompt?: string; referenceImages?: string[] }) => {
    const { currentModel } = get()
    set({ isGenerating: true, error: null })

    try {
      // Call AI service with selected model
      const result = await generateImage({
        prompt,
        negativePrompt: options?.negativePrompt,
        modelId: currentModel.id,
        referenceImages: options?.referenceImages,
      })

      // Convert to data URL
      const dataUrl = base64ToDataUrl(result.base64, result.mimeType)

      // Create image record
      const image: GeneratedImage = {
        id: `img-${Date.now()}`,
        dataUrl,
        prompt,
        modelId: currentModel.id,
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
