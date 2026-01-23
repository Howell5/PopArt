import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, TLImageShape, TLShapeId } from 'tldraw'
import { Copy, DownloadSimple, Info } from '@phosphor-icons/react'
import type { ImageMeta } from '../../utils/imageAssets'

// Format timestamp to relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  return `${days} 天前`
}

export default function FloatingToolbar() {
  const editor = useEditor()
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  // Close info popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setShowInfo(false)
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

  // Get the image data URL from selected image
  const getSelectedImageDataUrl = (): string | null => {
    if (!selectedImageId) return null

    const shape = editor.getShape(selectedImageId as TLShapeId) as TLImageShape
    if (!shape || shape.type !== 'image') return null

    const assetId = shape.props.assetId
    if (!assetId) return null

    const asset = editor.getAsset(assetId)
    if (!asset || asset.type !== 'image') return null

    return asset.props.src || null
  }

  // Get meta info from selected image
  const getSelectedImageMeta = (): ImageMeta | null => {
    if (!selectedImageId) return null

    const shape = editor.getShape(selectedImageId as TLShapeId) as TLImageShape
    if (!shape || shape.type !== 'image') return null

    return (shape.meta as unknown as ImageMeta) || null
  }

  // Duplicate image and place it to the right of the original
  const handleCopy = () => {
    if (!selectedImageId) return

    const shape = editor.getShape(selectedImageId as TLShapeId) as TLImageShape
    if (!shape || shape.type !== 'image') return

    const newShapeId = `shape:${Date.now()}` as TLShapeId
    editor.createShape({
      id: newShapeId,
      type: 'image',
      x: shape.x + shape.props.w! + 20, // Place to the right with 20px gap
      y: shape.y,
      props: {
        assetId: shape.props.assetId,
        w: shape.props.w,
        h: shape.props.h,
      },
      meta: shape.meta, // Copy meta as well
    })

    editor.select(newShapeId)
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

  // Hide toolbar when no image selected, no position, or during drag
  if (!selectedImageId || !toolbarPosition || isDragging) {
    return null
  }

  const meta = getSelectedImageMeta()

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
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        title="复制图片"
      >
        <Copy className="w-4 h-4" weight="bold" />
        <span>复制</span>
      </button>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        title="下载图片"
      >
        <DownloadSimple className="w-4 h-4" weight="bold" />
        <span>下载</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Info */}
      <div className="relative" ref={infoRef}>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            showInfo ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="图片信息"
        >
          <Info className="w-4 h-4" weight="bold" />
          <span>信息</span>
        </button>

        {/* Info Popover */}
        {showInfo && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">图片信息</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {/* Source */}
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500">来源</span>
                <span className="text-xs text-gray-900 font-medium">
                  {meta?.source === 'ai-generated' ? 'AI 生成' :
                   meta?.source === 'generating' ? '正在生成...' :
                   meta?.source === 'onboarding' ? '示例图片' : '本地上传'}
                </span>
              </div>

              {/* Model (AI or generating) */}
              {(meta?.source === 'ai-generated' || meta?.source === 'generating') && meta.modelName && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">模型</span>
                  <span className="text-xs text-gray-900 font-medium">{meta.modelName}</span>
                </div>
              )}

              {/* Resolution */}
              {meta?.originalWidth && meta?.originalHeight && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">分辨率</span>
                  <span className="text-xs text-gray-900 font-medium">
                    {meta.originalWidth} × {meta.originalHeight}
                  </span>
                </div>
              )}

              {/* Aspect Ratio (AI or generating) */}
              {(meta?.source === 'ai-generated' || meta?.source === 'generating') && meta.aspectRatio && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">比例</span>
                  <span className="text-xs text-gray-900 font-medium">{meta.aspectRatio}</span>
                </div>
              )}

              {/* Generated At (AI only) */}
              {meta?.source === 'ai-generated' && meta.generatedAt && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500">生成时间</span>
                  <span className="text-xs text-gray-900 font-medium">
                    {formatRelativeTime(meta.generatedAt)}
                  </span>
                </div>
              )}

              {/* Prompt (AI or generating) */}
              {(meta?.source === 'ai-generated' || meta?.source === 'generating') && meta.prompt && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 block mb-1">Prompt</span>
                  <p
                    className="text-xs text-gray-700 leading-relaxed max-h-24 overflow-y-auto select-text cursor-text"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {meta.prompt}
                  </p>
                </div>
              )}

              {/* No meta available */}
              {!meta && (
                <p className="text-xs text-gray-500">暂无信息</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
