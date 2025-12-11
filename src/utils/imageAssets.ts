import { Editor, TLAssetStore, uniqueId } from 'tldraw'

// Custom asset store for handling image uploads
export const createImageAssetStore = (): TLAssetStore => {
  return {
    // Upload asset (convert File to base64 data URL for now)
    async upload(_asset, file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          const dataUrl = reader.result as string
          resolve(dataUrl)
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
      })
    },

    // Resolve asset URL (return as-is since we're using data URLs)
    resolve(asset) {
      return asset.props.src
    },
  }
}

// Options for adding image to canvas
interface AddImageOptions {
  // Custom position. If anchorLeft is true, x is left edge; otherwise x is center
  position?: { x: number; y: number; anchorLeft?: boolean }
}

// Helper function to add an image to the canvas
export const addImageToCanvas = async (editor: Editor, file: File, options?: AddImageOptions) => {
  try {
    // Get position: custom or center of viewport
    const { x, y } = options?.position ?? editor.getViewportScreenCenter()

    // Create asset ID (must start with "asset:" prefix)
    const assetId = `asset:${uniqueId()}` as any

    // Read file as data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // Get image dimensions
    const dimensions = await getImageDimensions(dataUrl)

    // Create asset
    editor.createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: file.name,
          src: dataUrl,
          w: dimensions.width,
          h: dimensions.height,
          mimeType: file.type,
          isAnimated: false,
        },
        meta: {},
      },
    ])

    // Create image shape at center of viewport
    const maxWidth = 800
    const maxHeight = 600
    let width = dimensions.width
    let height = dimensions.height

    // Scale down if too large
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height)
      width *= scale
      height *= scale
    }

    // Calculate final position
    const anchorLeft = options?.position?.anchorLeft ?? false
    const finalX = anchorLeft ? x : x - width / 2
    const finalY = y - height / 2

    editor.createShape({
      type: 'image',
      x: finalX,
      y: finalY,
      props: {
        assetId,
        w: width,
        h: height,
      },
    })

  } catch (error) {
    throw error
  }
}

// Get image dimensions from data URL
const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

// Check if file is an image
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

// Add default image to canvas from URL
export const addDefaultImageToCanvas = async (editor: Editor, imageUrl: string) => {
  try {
    // Fetch image and convert to data URL
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    // Get image dimensions
    const dimensions = await getImageDimensions(dataUrl)

    // Create asset ID
    const assetId = `asset:${uniqueId()}` as any

    // Create asset
    editor.createAssets([
      {
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: 'default-image.jpg',
          src: dataUrl,
          w: dimensions.width,
          h: dimensions.height,
          mimeType: blob.type || 'image/jpeg',
          isAnimated: false,
        },
        meta: {},
      },
    ])

    // Scale to reasonable size
    const maxWidth = 500
    const maxHeight = 400
    let width = dimensions.width
    let height = dimensions.height

    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height)
      width *= scale
      height *= scale
    }

    // Place at canvas center (0, 0)
    editor.createShape({
      type: 'image',
      x: -width / 2,
      y: -height / 2,
      props: {
        assetId,
        w: width,
        h: height,
      },
    })

    // Center viewport on the image
    editor.zoomToFit()
  } catch (error) {
    console.error('Failed to add default image:', error)
  }
}
