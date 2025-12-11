// remove.bg API configuration
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg'

// Get API key from environment
const getApiKey = () => {
  const key = import.meta.env.VITE_REMOVE_BG_API_KEY
  if (!key) {
    throw new Error(
      'VITE_REMOVE_BG_API_KEY is not configured. Please add your remove.bg API key to .env.local'
    )
  }
  return key
}

export interface RemoveBackgroundParams {
  imageDataUrl: string
}

export interface ProcessedImage {
  base64: string
  mimeType: string
}

/**
 * Remove background from an image using remove.bg API
 */
export const removeBackground = async (
  params: RemoveBackgroundParams
): Promise<ProcessedImage> => {
  try {
    // Convert data URL to blob
    const response = await fetch(params.imageDataUrl)
    const blob = await response.blob()

    // Create form data
    const formData = new FormData()
    formData.append('image_file', blob)
    formData.append('size', 'auto')

    // Call remove.bg API
    const apiResponse = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': getApiKey(),
      },
      body: formData,
    })

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}))
      throw new Error(
        `remove.bg API error: ${apiResponse.status} ${apiResponse.statusText} - ${JSON.stringify(errorData)}`
      )
    }

    // Get the result blob
    const resultBlob = await apiResponse.blob()

    // Convert to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        // Extract base64 from data URL
        const base64Data = dataUrl.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(resultBlob)
    })

    return {
      base64,
      mimeType: resultBlob.type || 'image/png',
    }
  } catch (error) {
    console.error('Failed to remove background:', error)

    if (error instanceof Error) {
      throw new Error(`Background removal failed: ${error.message}`)
    }

    throw new Error('Background removal failed with unknown error')
  }
}
