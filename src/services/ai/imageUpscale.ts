import Replicate from 'replicate'

// Get API key from environment
const getApiKey = () => {
  const key = import.meta.env.VITE_REPLICATE_API_KEY
  if (!key) {
    throw new Error(
      'VITE_REPLICATE_API_KEY is not configured. Please add your Replicate API key to .env.local'
    )
  }
  return key
}

// Create Replicate client
const createClient = () => {
  return new Replicate({
    auth: getApiKey(),
  })
}

export interface UpscaleImageParams {
  imageDataUrl: string
  scale: 2 | 4
}

export interface UpscaledImage {
  url: string
}

/**
 * Upscale an image using Real-ESRGAN on Replicate
 * Model: nightmareai/real-esrgan
 */
export const upscaleImage = async (params: UpscaleImageParams): Promise<UpscaledImage> => {
  try {
    const replicate = createClient()

    console.log(`Upscaling image with Real-ESRGAN ${params.scale}x...`)

    // Call Real-ESRGAN model
    const output = (await replicate.run('nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b', {
      input: {
        image: params.imageDataUrl,
        scale: params.scale,
        face_enhance: false, // Disable face enhancement for general images
      },
    })) as any as string

    console.log('Upscale successful:', output)

    if (!output) {
      throw new Error('No output from upscale API')
    }

    return {
      url: output,
    }
  } catch (error) {
    console.error('Failed to upscale image:', error)

    if (error instanceof Error) {
      throw new Error(`Image upscale failed: ${error.message}`)
    }

    throw new Error('Image upscale failed with unknown error')
  }
}
