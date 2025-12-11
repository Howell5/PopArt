import OpenAI from 'openai'

// Configuration for AI image generation - 火山方舟 SeedDream 4.0
const ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3'
const SEEDREAM_MODEL = 'doubao-seedream-4-0-250828' // SeedDream 4.0

// Get API key from environment
const getApiKey = () => {
  const key = import.meta.env.VITE_ARK_API_KEY
  if (!key) {
    throw new Error('VITE_ARK_API_KEY is not configured. Please add your Volcano Ark API key to .env.local')
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
}

export interface GeneratedImage {
  base64: string
  mimeType: string
}

/**
 * Generate an image using ByteDance SeedDream 4.0 (火山方舟)
 * via OpenAI-compatible Images API
 */
export const generateImage = async (params: GenerateImageParams): Promise<GeneratedImage> => {
  try {
    const client = createClient()

    // Build the prompt
    let fullPrompt = params.prompt
    if (params.negativePrompt) {
      fullPrompt += `\n\nNegative prompt: ${params.negativePrompt}`
    }


    // Call SeedDream via OpenAI-compatible images.generate endpoint
    // Using 'as any' because Ark API supports extra parameters not in OpenAI SDK types
    const response = (await client.images.generate({
      model: SEEDREAM_MODEL,
      prompt: fullPrompt,
      size: '2K', // SeedDream supports: 1K, 2K, 4K
      response_format: 'b64_json', // Return base64 directly (避免 CORS 问题)
      extra_body: {
        watermark: true, // Add watermark
      },
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
