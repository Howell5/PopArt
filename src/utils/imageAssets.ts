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

// Helper function to add an image to the canvas
export const addImageToCanvas = async (editor: Editor, file: File) => {
  try {
    // Get the center of the viewport
    const { x, y } = editor.getViewportScreenCenter()

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

    editor.createShape({
      type: 'image',
      x: x - width / 2,
      y: y - height / 2,
      props: {
        assetId,
        w: width,
        h: height,
      },
    })

    console.log('Image added to canvas:', file.name)
  } catch (error) {
    console.error('Failed to add image to canvas:', error)
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
