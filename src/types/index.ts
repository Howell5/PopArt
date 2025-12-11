// AI Image Generation types
export interface ImageGenerationParams {
  prompt: string
  width?: number
  height?: number
  numOutputs?: number
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  createdAt: number
}

// AI Image Processing types
export interface ImageProcessingParams {
  imageUrl: string
  operation: 'upscale' | 'remove-background'
  scale?: number // for upscale
}

export interface ProcessedImage {
  id: string
  originalUrl: string
  processedUrl: string
  operation: string
  createdAt: number
}

// Store types
export interface AIStore {
  isGenerating: boolean
  isProcessing: boolean
  generatedImages: GeneratedImage[]
  error: string | null
  generateImage: (params: ImageGenerationParams) => Promise<void>
  processImage: (params: ImageProcessingParams) => Promise<void>
  clearError: () => void
}
