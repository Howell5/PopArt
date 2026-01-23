// Configuration for AI image generation - Nebula API
const NEBULA_BASE_URL = 'https://llm.ai-nebula.com/v1'

// Model provider types
type ModelProvider = 'gemini' | 'seedream'

// Available models configuration
export interface ImageModel {
  id: string
  name: string
  description: string
  size: string // Aspect ratio for Gemini (e.g., '1:1'), pixel dimensions for Seedream (e.g., '2048x2048')
  provider: ModelProvider
}

export const IMAGE_MODELS: ImageModel[] = [
  // Gemini models (default) - use aspect ratio for size, only support b64_json
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana',
    description: '默认推荐，速度快',
    size: '1:1',
    provider: 'gemini',
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana Pro',
    description: '更高质量输出',
    size: '1:1',
    provider: 'gemini',
  },
  // Seedream models - use pixel dimensions for size
  {
    id: 'doubao-seedream-4-5-251128',
    name: 'Seedream 4.5',
    description: '画质最佳',
    size: '2048x2048',
    provider: 'seedream',
  },
  {
    id: 'doubao-seedream-4-0-250828',
    name: 'Seedream 4.0',
    description: '稳定版，多图融合',
    size: '2048x2048',
    provider: 'seedream',
  },
  {
    id: 'doubao-seedream-3-0-t2i-250415',
    name: 'Seedream 3.0',
    description: '经典版，速度快',
    size: '1024x1024',
    provider: 'seedream',
  },
]

export const DEFAULT_MODEL = IMAGE_MODELS[0]

// Get API key from environment
const getApiKey = () => {
  const key = import.meta.env.VITE_NEBULA_API_KEY
  if (!key) {
    throw new Error(
      'VITE_NEBULA_API_KEY is not configured. Please add your Nebula API key to .env.local'
    )
  }
  return key
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

// Nebula API response format
interface NebulaResponse {
  code: number
  msg: string
  data: {
    data: Array<{
      b64_json?: string
      url?: string
    }>
  }
}

/**
 * Build request body for Gemini models
 */
const buildGeminiRequest = (
  model: ImageModel,
  prompt: string,
  referenceImages?: string[]
): Record<string, unknown> => {
  const requestBody: Record<string, unknown> = {
    model: model.id,
    size: model.size,
    response_format: 'b64_json',
  }

  // Image-to-image: use contents array
  if (referenceImages && referenceImages.length > 0) {
    requestBody.contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
          ...referenceImages.map((img) => ({ image: img })),
        ],
      },
    ]
  } else {
    // Text-to-image: use prompt
    requestBody.prompt = prompt
  }

  return requestBody
}

/**
 * Build request body for Seedream models
 */
const buildSeedreamRequest = (
  model: ImageModel,
  prompt: string,
  referenceImages?: string[]
): Record<string, unknown> => {
  const requestBody: Record<string, unknown> = {
    model: model.id,
    size: model.size,
    watermark: false,
  }

  // Image-to-image: use contents array (same as Gemini)
  if (referenceImages && referenceImages.length > 0) {
    requestBody.contents = [
      {
        role: 'user',
        parts: [
          ...referenceImages.map((img) => ({ image: img })),
          { text: prompt },
        ],
      },
    ]
  } else {
    // Text-to-image: use prompt
    requestBody.prompt = prompt
  }

  return requestBody
}

/**
 * Generate an image using Nebula API (Gemini or Seedream models)
 */
export const generateImage = async (params: GenerateImageParams): Promise<GeneratedImage> => {
  try {
    const modelId = params.modelId || DEFAULT_MODEL.id
    const model = IMAGE_MODELS.find((m) => m.id === modelId) || DEFAULT_MODEL

    // Build the prompt
    let fullPrompt = params.prompt
    if (params.negativePrompt) {
      fullPrompt += `\n\nNegative prompt: ${params.negativePrompt}`
    }

    // Build request body based on provider
    const requestBody =
      model.provider === 'gemini'
        ? buildGeminiRequest(model, fullPrompt, params.referenceImages)
        : buildSeedreamRequest(model, fullPrompt, params.referenceImages)

    // Call Nebula API
    const response = await fetch(`${NEBULA_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Nebula API request failed: ${response.status} - ${errorText}`)
    }

    const result: NebulaResponse = await response.json()

    // Check Nebula response code
    if (result.code !== 200) {
      throw new Error(`Nebula API error: ${result.msg}`)
    }

    // Extract base64 data from response
    const imageData = result.data?.data?.[0]
    if (!imageData) {
      throw new Error('No image data in response')
    }

    const base64 = imageData.b64_json
    if (!base64) {
      throw new Error('No base64 data in response')
    }

    return {
      base64,
      mimeType: 'image/png',
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
