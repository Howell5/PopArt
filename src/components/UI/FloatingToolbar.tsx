import { useState, useEffect, useCallback } from 'react'
import { useEditor, TLImageShape } from 'tldraw'
import { upscaleImage } from '../../services/ai/imageUpscale'
import { removeBackground } from '../../services/ai/backgroundRemoval'
import { base64ToDataUrl } from '../../services/ai/imageGeneration'
import { Copy, DownloadSimple, MagnifyingGlassPlus, Eraser, SpinnerGap } from '@phosphor-icons/react'

export default function FloatingToolbar() {
  const editor = useEditor()
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Track dragging state using tldraw's pointer state
  useEffect(() => {
    const checkDragging = () => {
      // Check if user is currently dragging (pointer is down and moving)
      const isDraggingNow = editor.inputs.isDragging
      setIsDragging(isDraggingNow)
    }

    // Listen to pointer move events to detect dragging
    const interval = setInterval(checkDragging, 50)

    return () => {
      clearInterval(interval)
    }
  }, [editor])

  // Update selection and position
  const updateSelection = useCallback(() => {
    const selectedShapes = editor.getSelectedShapes()

    // Check if exactly one image is selected
    if (selectedShapes.length === 1 && selectedShapes[0].type === 'image') {
      const shape = selectedShapes[0] as TLImageShape
      setSelectedImageId(shape.id)

      // Get the screen bounds of the shape
      const bounds = editor.getShapePageBounds(shape.id)
      if (bounds) {
        // Convert page coordinates to screen coordinates
        const screenPoint = editor.pageToScreen({ x: bounds.x + bounds.w / 2, y: bounds.y })
        setToolbarPosition({
          x: screenPoint.x,
          y: screenPoint.y - 60, // Position above the shape
        })
      }
    } else {
      setSelectedImageId(null)
      setToolbarPosition(null)
    }
  }, [editor])

  // Listen for selection and camera changes
  useEffect(() => {
    updateSelection()

    const disposables = [
      editor.store.listen(() => updateSelection()),
    ]

    return () => {
      disposables.forEach((d) => d())
    }
  }, [editor, updateSelection])

  // Helper function to get image dimensions
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

  // Get the image data URL from selected image
  const getSelectedImageDataUrl = (): string | null => {
    if (!selectedImageId) return null

    const shape = editor.getShape(selectedImageId as any) as TLImageShape
    if (!shape || shape.type !== 'image') return null

    const assetId = shape.props.assetId
    if (!assetId) return null

    const asset = editor.getAsset(assetId)
    if (!asset || asset.type !== 'image') return null

    return asset.props.src || null
  }

  // Duplicate image and place it to the right of the original
  const handleCopy = () => {
    if (!selectedImageId) return

    const shape = editor.getShape(selectedImageId as any) as TLImageShape
    if (!shape || shape.type !== 'image') return

    const newShapeId = `shape:${Date.now()}`
    editor.createShape({
      id: newShapeId as any,
      type: 'image',
      x: shape.x + shape.props.w! + 20, // Place to the right with 20px gap
      y: shape.y,
      props: {
        assetId: shape.props.assetId,
        w: shape.props.w,
        h: shape.props.h,
      },
    })

    editor.select(newShapeId as any)
  }

  // Download image
  const handleDownload = () => {
    const dataUrl = getSelectedImageDataUrl()
    if (!dataUrl) return

    try {
      // Create download link
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      alert('Failed to download image')
    }
  }

  const handleUpscale = async (scale: 2 | 4) => {
    if (!selectedImageId || isProcessing) return

    try {
      setIsProcessing(true)
      setProcessingType(`upscale-${scale}x`)

      const shape = editor.getShape(selectedImageId as any) as TLImageShape
      if (!shape || shape.type !== 'image') {
        throw new Error('Selected shape is not an image')
      }

      const assetId = shape.props.assetId
      if (!assetId) {
        throw new Error('No asset ID')
      }
      const asset = editor.getAsset(assetId)
      if (!asset || asset.type !== 'image') {
        throw new Error('Asset not found')
      }

      const imageDataUrl = asset.props.src!

      const result = await upscaleImage({
        imageDataUrl,
        scale,
      })

      // Fetch the upscaled image and convert to data URL
      const response = await fetch(result.url)
      const blob = await response.blob()
      const upscaledDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const dimensions = await getImageDimensions(upscaledDataUrl)

      const newAssetId = `asset:${Date.now()}`
      editor.createAssets([
        {
          id: newAssetId as any,
          type: 'image',
          typeName: 'asset',
          props: {
            name: `upscaled-${scale}x.png`,
            src: upscaledDataUrl,
            w: dimensions.width,
            h: dimensions.height,
            mimeType: 'image/png',
            isAnimated: false,
          },
          meta: {},
        },
      ])

      // Create new image shape next to the original (instead of replacing)
      const newWidth = shape.props.w! * scale
      const newHeight = shape.props.h! * scale
      const newShapeId = `shape:${Date.now()}`

      editor.createShape({
        id: newShapeId as any,
        type: 'image',
        x: shape.x + shape.props.w! + 20, // Place to the right of original
        y: shape.y,
        props: {
          assetId: newAssetId as any,
          w: newWidth,
          h: newHeight,
        },
      })

      // Select the new shape
      editor.select(newShapeId as any)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to upscale image')
    } finally {
      setIsProcessing(false)
      setProcessingType(null)
    }
  }

  const handleRemoveBackground = async () => {
    if (!selectedImageId || isProcessing) return

    try {
      setIsProcessing(true)
      setProcessingType('remove-bg')

      const shape = editor.getShape(selectedImageId as any) as TLImageShape
      if (!shape || shape.type !== 'image') {
        throw new Error('Selected shape is not an image')
      }

      const assetId = shape.props.assetId
      if (!assetId) {
        throw new Error('No asset ID')
      }
      const asset = editor.getAsset(assetId)
      if (!asset || asset.type !== 'image') {
        throw new Error('Asset not found')
      }

      const imageDataUrl = asset.props.src!

      const result = await removeBackground({
        imageDataUrl,
      })

      const processedDataUrl = base64ToDataUrl(result.base64, result.mimeType)
      const dimensions = await getImageDimensions(processedDataUrl)

      const newAssetId = `asset:${Date.now()}`
      editor.createAssets([
        {
          id: newAssetId as any,
          type: 'image',
          typeName: 'asset',
          props: {
            name: 'no-background.png',
            src: processedDataUrl,
            w: dimensions.width,
            h: dimensions.height,
            mimeType: result.mimeType,
            isAnimated: false,
          },
          meta: {},
        },
      ])

      // Create new image shape next to the original (instead of replacing)
      const newShapeId = `shape:${Date.now()}`

      editor.createShape({
        id: newShapeId as any,
        type: 'image',
        x: shape.x + shape.props.w! + 20, // Place to the right of original
        y: shape.y,
        props: {
          assetId: newAssetId as any,
          w: shape.props.w!, // Keep same display size
          h: shape.props.h!,
        },
      })

      // Select the new shape
      editor.select(newShapeId as any)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove background')
    } finally {
      setIsProcessing(false)
      setProcessingType(null)
    }
  }

  // Hide toolbar when no image selected, no position, or during drag
  if (!selectedImageId || !toolbarPosition || isDragging) {
    return null
  }

  return (
    <div
      className="fixed z-50 flex items-center gap-1 px-2 py-1.5 bg-white rounded-full shadow-lg border border-gray-200"
      style={{
        left: toolbarPosition.x,
        top: toolbarPosition.y,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Copy */}
      <button
        onClick={handleCopy}
        disabled={isProcessing}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Copy to clipboard"
      >
        <Copy className="w-4 h-4" weight="bold" />
        <span>复制</span>
      </button>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={isProcessing}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download image"
      >
        <DownloadSimple className="w-4 h-4" weight="bold" />
        <span>下载</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Upscale 2x - disabled */}
      <button
        onClick={() => handleUpscale(2)}
        disabled={true}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 rounded-full transition-colors opacity-50 cursor-not-allowed"
        title="Upscale 2x (coming soon)"
      >
        <MagnifyingGlassPlus className="w-4 h-4" />
        <span>2x</span>
      </button>

      {/* Upscale 4x - disabled */}
      <button
        onClick={() => handleUpscale(4)}
        disabled={true}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 rounded-full transition-colors opacity-50 cursor-not-allowed"
        title="Upscale 4x (coming soon)"
      >
        <MagnifyingGlassPlus className="w-4 h-4" />
        <span>4x</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Remove Background */}
      <button
        onClick={handleRemoveBackground}
        disabled={isProcessing}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove Background"
      >
        {isProcessing && processingType === 'remove-bg' ? (
          <SpinnerGap className="w-4 h-4 animate-spin" />
        ) : (
          <Eraser className="w-4 h-4" weight="bold" />
        )}
        <span>移除背景</span>
      </button>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          处理中...
        </div>
      )}
    </div>
  )
}
