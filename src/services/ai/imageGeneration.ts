import OpenAI from 'openai'

// Configuration for AI image generation - 火山方舟
const ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'

// Available models configuration
export interface ImageModel {
  id: string
  name: string
  description: string
  maxSize: string
}

export const IMAGE_MODELS: ImageModel[] = [
  // {
  //   id: 'doubao-seedream-4-5-250928',
  //   name: 'Seedream 4.5',
  //   description: '最新版，画质最佳',
  //   maxSize: '4K',
  // },
  {
    id: 'doubao-seedream-4-0-250828',
    name: 'Seedream 4.0',
    description: '稳定版，多图融合',
    maxSize: '4K',
  },
  {
    id: 'doubao-seedream-3-0-t2i-250728',
    name: 'Seedream 3.0',
    description: '经典版，速度快',
    maxSize: '2K',
  },
]

export const DEFAULT_MODEL = IMAGE_MODELS[0]

// Get API key from environment
const getApiKey = () => {
  const key = import.meta.env.VITE_ARK_API_KEY
  if (!key) {
    throw new Error(
      'VITE_ARK_API_KEY is not configured. Please add your Volcano Ark API key to .env.local'
    )
  }
  return key
}

// Create OpenAI client configured for Volcano Ark (火山方舟)
const createClient = () => {
  return new OpenAI({
    apiKey: getApiKey(),
    baseURL: ARK_BASE_URL,
    dangerouslyAllowBrowser: true, // Allow browser usage
  })
}

export interface GenerateImageParams {
  prompt: string
  negativePrompt?: string
  modelId?: string
  referenceImages?: string[] // Array of data URLs or URLs for image-to-image
}

export interface GeneratedImage {
  base64: string
  mimeType: string
}

/**
 * Generate an image using ByteDance Seedream (火山方舟)
 * via OpenAI-compatible Images API
 */
export const generateImage = async (params: GenerateImageParams): Promise<GeneratedImage> => {
  try {
    const client = createClient()
    const modelId = params.modelId || DEFAULT_MODEL.id
    const model = IMAGE_MODELS.find((m) => m.id === modelId) || DEFAULT_MODEL

    // Build the prompt
    let fullPrompt = params.prompt
    if (params.negativePrompt) {
      fullPrompt += `\n\nNegative prompt: ${params.negativePrompt}`
    }

    // Build request body
    // Note: 'image' parameter goes at top level, not in extra_body per Ark API docs
    const requestBody: Record<string, unknown> = {
      model: modelId,
      prompt: fullPrompt,
      size: model.maxSize === '4K' ? '2K' : '1K',
      response_format: 'b64_json',
    }

    // Add reference images for image-to-image generation (top level parameter)
    if (params.referenceImages && params.referenceImages.length > 0) {
      if (params.referenceImages.length === 1) {
        requestBody.image = params.referenceImages[0]
      } else {
        requestBody.image = params.referenceImages
      }
    }

    // Call Seedream via OpenAI-compatible images.generate endpoint
    const response = (await client.images.generate({
      ...requestBody,
      // extra_body: {
      //   watermark: true,
      // },
    } as any)) as any

    // Get the base64 data from response
    if (!response.data || response.data.length === 0) {
      throw new Error('No image data in response')
    }

    const base64 = response.data[0]?.b64_json

    if (!base64) {
      throw new Error('No base64 data in response')
    }

    return {
      base64,
      mimeType: 'image/png', // SeedDream returns PNG format
    }
  } catch (error) {
    console.error('Failed to generate image:', error)

    if (error instanceof Error) {
      throw new Error(`Image generation failed: ${error.message}`)
    }

    throw new Error('Image generation failed with unknown error')
  }
}

/**
 * Convert base64 to data URL
 */
export const base64ToDataUrl = (base64: string, mimeType: string): string => {
  return `data:${mimeType};base64,${base64}`
}
