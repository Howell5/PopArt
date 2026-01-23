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

// Metadata for AI-generated images
export interface ImageMeta {
  source: 'ai-generated' | 'uploaded' | 'generating'
  // Task ID for generating images
  taskId?: string
  // AI generation info (only for ai-generated)
  modelId?: string
  modelName?: string
  prompt?: string
  aspectRatio?: string
  imageSize?: string
  generatedAt?: number
  // Image dimensions (for all images)
  originalWidth?: number
  originalHeight?: number
}

// Options for adding image to canvas
interface AddImageOptions {
  // Custom position. If anchorLeft is true, x is left edge; otherwise x is center
  position?: { x: number; y: number; anchorLeft?: boolean }
  // Metadata to attach to the shape
  meta?: ImageMeta
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

    // Build meta with defaults for uploaded images
    const meta: ImageMeta = options?.meta ?? {
      source: 'uploaded',
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
    }

    // Always include original dimensions
    if (!meta.originalWidth) meta.originalWidth = dimensions.width
    if (!meta.originalHeight) meta.originalHeight = dimensions.height

    editor.createShape({
      type: 'image',
      x: finalX,
      y: finalY,
      props: {
        assetId,
        w: width,
        h: height,
      },
      meta: meta as any,
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

// Bounding box type
interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// Check if two bounding boxes overlap
const boxesOverlap = (a: BoundingBox, b: BoundingBox, gap = 0): boolean => {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  )
}

// Check if a box overlaps with any existing boxes
const overlapsAny = (box: BoundingBox, existingBoxes: BoundingBox[], gap: number): boolean => {
  return existingBoxes.some((existing) => boxesOverlap(box, existing, gap))
}

// Direction priorities for finding empty space
type Direction = 'right' | 'bottom' | 'left' | 'top'
const DIRECTIONS: Direction[] = ['right', 'bottom', 'left', 'top']

// Get candidate position based on direction
const getCandidatePosition = (
  anchorBox: BoundingBox,
  newWidth: number,
  newHeight: number,
  direction: Direction,
  gap: number
): { x: number; y: number } => {
  switch (direction) {
    case 'right':
      return {
        x: anchorBox.x + anchorBox.width + gap,
        y: anchorBox.y + anchorBox.height / 2 - newHeight / 2,
      }
    case 'bottom':
      return {
        x: anchorBox.x + anchorBox.width / 2 - newWidth / 2,
        y: anchorBox.y + anchorBox.height + gap,
      }
    case 'left':
      return {
        x: anchorBox.x - newWidth - gap,
        y: anchorBox.y + anchorBox.height / 2 - newHeight / 2,
      }
    case 'top':
      return {
        x: anchorBox.x + anchorBox.width / 2 - newWidth / 2,
        y: anchorBox.y - newHeight - gap,
      }
  }
}

// Find a non-overlapping position for a new shape
export const findNonOverlappingPosition = (
  editor: Editor,
  anchorShapeIds: string[],
  newWidth: number,
  newHeight: number,
  options?: { gap?: number; excludeShapeIds?: string[] }
): { x: number; y: number } => {
  const gap = options?.gap ?? 30
  const excludeIds = new Set(options?.excludeShapeIds ?? [])

  // Get all existing shape bounding boxes (excluding only explicitly excluded shapes)
  // NOTE: Anchor shapes ARE included in collision detection - they're only used to determine
  // the reference point for placement direction, not to be excluded from overlap checks
  const allShapes = editor.getCurrentPageShapes()
  const existingBoxes: BoundingBox[] = allShapes
    .filter((shape) => !excludeIds.has(shape.id))
    .map((shape) => {
      const bounds = editor.getShapePageBounds(shape.id)
      if (!bounds) return null
      return { x: bounds.x, y: bounds.y, width: bounds.w, height: bounds.h }
    })
    .filter((box): box is BoundingBox => box !== null)

  // Get anchor shapes bounding box (combined)
  let anchorBox: BoundingBox | null = null
  for (const shapeId of anchorShapeIds) {
    const bounds = editor.getShapePageBounds(shapeId as any)
    if (!bounds) continue

    if (!anchorBox) {
      anchorBox = { x: bounds.x, y: bounds.y, width: bounds.w, height: bounds.h }
    } else {
      // Expand to include this shape
      const minX = Math.min(anchorBox.x, bounds.x)
      const minY = Math.min(anchorBox.y, bounds.y)
      const maxX = Math.max(anchorBox.x + anchorBox.width, bounds.x + bounds.w)
      const maxY = Math.max(anchorBox.y + anchorBox.height, bounds.y + bounds.h)
      anchorBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
    }
  }

  // If no anchor shapes, use viewport center as virtual anchor point
  // and try placing centered first (only when no real anchor shapes)
  if (!anchorBox) {
    // Get viewport center in page coordinates
    const viewportPageBounds = editor.getViewportPageBounds()
    const centerX = viewportPageBounds.x + viewportPageBounds.w / 2
    const centerY = viewportPageBounds.y + viewportPageBounds.h / 2

    // Try placing at viewport center first
    const centeredCandidate: BoundingBox = {
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight,
    }

    if (!overlapsAny(centeredCandidate, existingBoxes, gap)) {
      return { x: centeredCandidate.x, y: centeredCandidate.y }
    }

    // Create a zero-size anchor at viewport center for directional search
    anchorBox = { x: centerX, y: centerY, width: 0, height: 0 }
  }

  // Try each direction around the anchor, with increasing distance if needed
  const maxAttempts = 10
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const multiplier = attempt + 1

    for (const direction of DIRECTIONS) {
      // Calculate effective gap for this attempt
      const effectiveGap = gap * multiplier

      const candidate = getCandidatePosition(anchorBox, newWidth, newHeight, direction, effectiveGap)
      const candidateBox: BoundingBox = {
        x: candidate.x,
        y: candidate.y,
        width: newWidth,
        height: newHeight,
      }

      if (!overlapsAny(candidateBox, existingBoxes, gap)) {
        return candidate
      }
    }
  }

  // Fallback: place to the right with large offset
  return {
    x: anchorBox.x + anchorBox.width + gap * 5,
    y: anchorBox.y + anchorBox.height / 2 - newHeight / 2,
  }
}

// A 1x1 transparent PNG as placeholder
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// Calculate placeholder dimensions based on aspect ratio
export const getPlaceholderDimensions = (aspectRatio: string, baseSize = 500): { width: number; height: number } => {
  const [w, h] = aspectRatio.split(':').map(Number)
  if (!w || !h) return { width: baseSize, height: baseSize }

  const ratio = w / h
  if (ratio >= 1) {
    // Landscape or square: width is base, height is smaller
    return { width: baseSize, height: Math.round(baseSize / ratio) }
  } else {
    // Portrait: height is base, width is smaller
    return { width: Math.round(baseSize * ratio), height: baseSize }
  }
}

// Options for creating placeholder shape
export interface PlaceholderOptions {
  taskId: string
  aspectRatio: string
  modelId: string
  modelName: string
  prompt: string
  imageSize: string
  position?: { x: number; y: number; anchorLeft?: boolean }
}

// Create a placeholder shape for generating image
export const createPlaceholderShape = (editor: Editor, options: PlaceholderOptions): string => {
  const { taskId, aspectRatio, modelId, modelName, prompt, imageSize, position } = options

  // Calculate dimensions based on aspect ratio
  const { width, height } = getPlaceholderDimensions(aspectRatio)

  // Get position: custom or center of viewport
  const { x, y } = position ?? editor.getViewportScreenCenter()
  const anchorLeft = position?.anchorLeft ?? false
  const finalX = anchorLeft ? x : x - width / 2
  const finalY = y - height / 2

  // Create asset for placeholder
  const assetId = `asset:${uniqueId()}` as any
  editor.createAssets([
    {
      id: assetId,
      type: 'image',
      typeName: 'asset',
      props: {
        name: 'placeholder',
        src: PLACEHOLDER_IMAGE,
        w: 1,
        h: 1,
        mimeType: 'image/png',
        isAnimated: false,
      },
      meta: {},
    },
  ])

  // Create placeholder shape
  const shapeId = `shape:${uniqueId()}` as any
  editor.createShape({
    id: shapeId,
    type: 'image',
    x: finalX,
    y: finalY,
    props: {
      assetId,
      w: width,
      h: height,
    },
    meta: {
      source: 'generating',
      taskId,
      modelId,
      modelName,
      prompt,
      aspectRatio,
      imageSize,
    } as any,
  })

  return shapeId
}

// Update placeholder shape with real image
export const updatePlaceholderWithImage = async (
  editor: Editor,
  shapeId: string,
  dataUrl: string
): Promise<void> => {
  const shape = editor.getShape(shapeId as any)
  if (!shape || shape.type !== 'image') return

  // Get image dimensions
  const dimensions = await getImageDimensions(dataUrl)

  // Create new asset with real image
  const newAssetId = `asset:${uniqueId()}` as any
  editor.createAssets([
    {
      id: newAssetId,
      type: 'image',
      typeName: 'asset',
      props: {
        name: 'generated-image.png',
        src: dataUrl,
        w: dimensions.width,
        h: dimensions.height,
        mimeType: 'image/png',
        isAnimated: false,
      },
      meta: {},
    },
  ])

  // Get current meta and update it
  const currentMeta = shape.meta as any
  const newMeta: ImageMeta = {
    source: 'ai-generated',
    modelId: currentMeta.modelId,
    modelName: currentMeta.modelName,
    prompt: currentMeta.prompt,
    aspectRatio: currentMeta.aspectRatio,
    imageSize: currentMeta.imageSize,
    generatedAt: Date.now(),
    originalWidth: dimensions.width,
    originalHeight: dimensions.height,
  }

  // Update shape with new asset and meta
  editor.updateShape({
    id: shapeId as any,
    type: 'image',
    props: {
      assetId: newAssetId,
    },
    meta: newMeta as any,
  })
}

// Remove placeholder shape (on error)
export const removePlaceholderShape = (editor: Editor, shapeId: string): void => {
  editor.deleteShape(shapeId as any)
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

    // Get viewport bounds to calculate center
    const viewportBounds = editor.getViewportScreenBounds()
    const centerX = viewportBounds.w / 2 - width / 2
    const centerY = viewportBounds.h / 2 - height / 2

    // Place image at viewport center
    editor.createShape({
      type: 'image',
      x: centerX,
      y: centerY,
      props: {
        assetId,
        w: width,
        h: height,
      },
      meta: {
        source: 'uploaded',
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
      } as any,
    })

    // Reset zoom to 100% at current position
    editor.resetZoom()
  } catch (error) {
    console.error('Failed to add default image:', error)
  }
}
