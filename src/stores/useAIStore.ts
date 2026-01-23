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

// Maximum concurrent generation tasks
export const MAX_CONCURRENT_TASKS = 5

// Generating task info
export interface GeneratingTask {
  id: string
  shapeId: string
  prompt: string
  modelId: string
  modelName: string
  aspectRatio: string
  imageSize: string
  startedAt: number
}

interface GeneratedImage {
  id: string
  dataUrl: string
  prompt: string
  modelId: string
  createdAt: number
}

interface AIStore {
  // State
  generatingTasks: Map<string, GeneratingTask>
  generatedImages: GeneratedImage[]
  error: string | null
  currentPrompt: string
  currentModel: ImageModel
  // Gemini options
  geminiAspectRatio: string
  geminiImageSize: GeminiImageSize
  // Seedream options
  seedreamSize: string

  // Computed
  isGenerating: boolean
  canStartNewTask: boolean
  generatingCount: number

  // Actions
  setCurrentPrompt: (prompt: string) => void
  setCurrentModel: (model: ImageModel) => void
  setGeminiAspectRatio: (ratio: string) => void
  setGeminiImageSize: (size: GeminiImageSize) => void
  setSeedreamSize: (size: string) => void
  startGenerating: (taskId: string, shapeId: string, prompt: string) => void
  completeGenerating: (taskId: string, dataUrl: string) => void
  failGenerating: (taskId: string, error: string) => void
  generateImage: (prompt: string, options?: { negativePrompt?: string; referenceImages?: string[] }) => Promise<{ taskId: string; dataUrl: string }>
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
  generatingTasks: new Map(),
  generatedImages: [],
  error: null,
  currentPrompt: '',
  currentModel: DEFAULT_MODEL,
  geminiAspectRatio: DEFAULT_GEMINI_ASPECT_RATIO,
  geminiImageSize: DEFAULT_GEMINI_IMAGE_SIZE,
  seedreamSize: DEFAULT_SEEDREAM_SIZE,

  // Computed getters (will be updated when tasks change)
  get isGenerating() {
    return get().generatingTasks.size > 0
  },
  get canStartNewTask() {
    return get().generatingTasks.size < MAX_CONCURRENT_TASKS
  },
  get generatingCount() {
    return get().generatingTasks.size
  },

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

  // Start a generating task
  startGenerating: (taskId: string, shapeId: string, prompt: string) => {
    const { currentModel, geminiAspectRatio, geminiImageSize, seedreamSize } = get()
    const isGemini = currentModel.provider === 'gemini'

    const task: GeneratingTask = {
      id: taskId,
      shapeId,
      prompt,
      modelId: currentModel.id,
      modelName: currentModel.name,
      aspectRatio: isGemini ? geminiAspectRatio : SEEDREAM_SIZES_2K.find(s => s.value === seedreamSize)?.label || '1:1',
      imageSize: isGemini ? geminiImageSize : seedreamSize,
      startedAt: Date.now(),
    }

    set((state) => {
      const newTasks = new Map(state.generatingTasks)
      newTasks.set(taskId, task)
      return { generatingTasks: newTasks }
    })
  },

  // Complete a generating task
  completeGenerating: (taskId: string, dataUrl: string) => {
    const task = get().generatingTasks.get(taskId)
    if (!task) return

    // Create image record
    const image: GeneratedImage = {
      id: `img-${Date.now()}`,
      dataUrl,
      prompt: task.prompt,
      modelId: task.modelId,
      createdAt: Date.now(),
    }

    set((state) => {
      const newTasks = new Map(state.generatingTasks)
      newTasks.delete(taskId)
      return {
        generatingTasks: newTasks,
        generatedImages: [image, ...state.generatedImages],
      }
    })
  },

  // Fail a generating task
  failGenerating: (taskId: string, error: string) => {
    set((state) => {
      const newTasks = new Map(state.generatingTasks)
      newTasks.delete(taskId)
      return {
        generatingTasks: newTasks,
        error,
      }
    })
  },

  // Generate image (returns taskId and dataUrl promise)
  generateImage: async (prompt: string, options?: { negativePrompt?: string; referenceImages?: string[] }) => {
    const { currentModel, geminiAspectRatio, geminiImageSize, seedreamSize, canStartNewTask } = get()

    if (!canStartNewTask) {
      throw new Error(`最多同时生成 ${MAX_CONCURRENT_TASKS} 张图片`)
    }

    const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

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

      return { taskId, dataUrl }
    } catch (error) {
      console.error('Image generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      throw new Error(errorMessage)
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
