import { create } from 'zustand'
import {
  generateImage,
  base64ToDataUrl,
  IMAGE_MODELS,
  DEFAULT_MODEL,
  DEFAULT_GEMINI_ASPECT_RATIO,
  DEFAULT_GEMINI_IMAGE_SIZE,
  DEFAULT_SEEDREAM_SIZE,
  GEMINI_ASPECT_RATIOS,
  GEMINI_IMAGE_SIZES,
  SEEDREAM_SIZES_2K,
  type ImageModel,
  type GeminiImageSize,
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
  // Gemini options
  geminiAspectRatio: string
  geminiImageSize: GeminiImageSize
  // Seedream options
  seedreamSize: string

  // Actions
  setCurrentPrompt: (prompt: string) => void
  setCurrentModel: (model: ImageModel) => void
  setGeminiAspectRatio: (ratio: string) => void
  setGeminiImageSize: (size: GeminiImageSize) => void
  setSeedreamSize: (size: string) => void
  generateImage: (prompt: string, options?: { negativePrompt?: string; referenceImages?: string[] }) => Promise<string>
  clearError: () => void
  clearHistory: () => void
}

// Export for convenience
export {
  IMAGE_MODELS,
  DEFAULT_MODEL,
  GEMINI_ASPECT_RATIOS,
  GEMINI_IMAGE_SIZES,
  SEEDREAM_SIZES_2K,
  type ImageModel,
  type GeminiImageSize,
}

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial state
  isGenerating: false,
  generatedImages: [],
  error: null,
  currentPrompt: '',
  currentModel: DEFAULT_MODEL,
  geminiAspectRatio: DEFAULT_GEMINI_ASPECT_RATIO,
  geminiImageSize: DEFAULT_GEMINI_IMAGE_SIZE,
  seedreamSize: DEFAULT_SEEDREAM_SIZE,

  // Set current prompt
  setCurrentPrompt: (prompt: string) => {
    set({ currentPrompt: prompt })
  },

  // Set current model
  setCurrentModel: (model: ImageModel) => {
    set({ currentModel: model })
  },

  // Set Gemini aspect ratio
  setGeminiAspectRatio: (ratio: string) => {
    set({ geminiAspectRatio: ratio })
  },

  // Set Gemini image size
  setGeminiImageSize: (size: GeminiImageSize) => {
    set({ geminiImageSize: size })
  },

  // Set Seedream size
  setSeedreamSize: (size: string) => {
    set({ seedreamSize: size })
  },

  // Generate image
  generateImage: async (prompt: string, options?: { negativePrompt?: string; referenceImages?: string[] }) => {
    const { currentModel, geminiAspectRatio, geminiImageSize, seedreamSize } = get()
    set({ isGenerating: true, error: null })

    try {
      // Call AI service with selected model and options
      const result = await generateImage({
        prompt,
        negativePrompt: options?.negativePrompt,
        modelId: currentModel.id,
        referenceImages: options?.referenceImages,
        // Gemini options
        aspectRatio: currentModel.provider === 'gemini' ? geminiAspectRatio : undefined,
        imageSize: currentModel.provider === 'gemini' ? geminiImageSize : undefined,
        // Seedream options
        size: currentModel.provider === 'seedream' ? seedreamSize : undefined,
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
