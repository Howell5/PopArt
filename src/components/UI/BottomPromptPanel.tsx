import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, TLImageShape } from 'tldraw'
import { useAIStore, IMAGE_MODELS } from '../../stores/useAIStore'
import { addImageToCanvas } from '../../utils/imageAssets'
import { X, ArrowRight, SpinnerGap, Cube, Check } from '@phosphor-icons/react'

interface SelectedImage {
  id: string
  src: string
}

export default function BottomPromptPanel() {
  const editor = useEditor()
  const { isGenerating, generateImage, currentModel, setCurrentModel } = useAIStore()
  const [showModelPicker, setShowModelPicker] = useState(false)
  const modelPickerRef = useRef<HTMLDivElement>(null)

  const [prompt, setPrompt] = useState('')
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])

  // Track selected images (supports multiple selection)
  const updateSelection = useCallback(() => {
    const selectedShapes = editor.getSelectedShapes()

    // Filter for image shapes only
    const imageShapes = selectedShapes.filter(
      (shape): shape is TLImageShape => shape.type === 'image'
    )

    if (imageShapes.length > 0) {
      const images: SelectedImage[] = []

      for (const shape of imageShapes) {
        const assetId = shape.props.assetId
        if (assetId) {
          const asset = editor.getAsset(assetId)
          if (asset && asset.type === 'image' && asset.props.src) {
            images.push({
              id: shape.id,
              src: asset.props.src,
            })
          }
        }
      }

      setSelectedImages(images)
    } else {
      setSelectedImages([])
    }
  }, [editor])

  useEffect(() => {
    updateSelection()
    const dispose = editor.store.listen(() => updateSelection())
    return () => dispose()
  }, [editor, updateSelection])

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    try {
      // Collect reference images for image-to-image generation
      const referenceImages = selectedImages.length > 0
        ? selectedImages.map(img => img.src)
        : undefined

      // Calculate position for new image (next to reference images if any)
      let position: { x: number; y: number; anchorLeft?: boolean } | undefined
      if (selectedImages.length > 0) {
        // Find the rightmost edge of selected images
        const selectedShapes = editor.getSelectedShapes().filter(
          (shape): shape is TLImageShape => shape.type === 'image'
        )
        if (selectedShapes.length > 0) {
          let maxRight = -Infinity
          let centerY = 0
          for (const shape of selectedShapes) {
            const right = shape.x + (shape.props.w ?? 0)
            if (right > maxRight) {
              maxRight = right
              centerY = shape.y + (shape.props.h ?? 0) / 2
            }
          }
          // Place new image 30px to the right of the rightmost image
          position = { x: maxRight + 30, y: centerY, anchorLeft: true }
        }
      }

      // Generate image with prompt and optional reference images
      const dataUrl = await generateImage(prompt, { referenceImages })

      // Convert data URL to File
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], 'generated-image.png', { type: 'image/png' })

      // Add to canvas (near reference images or at viewport center)
      await addImageToCanvas(editor, file, position ? { position } : undefined)

      // Clear prompt after successful generation
      setPrompt('')
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const clearSelectedImages = () => {
    editor.selectNone()
    setSelectedImages([])
  }

  const removeSelectedImage = (imageId: string) => {
    // Deselect just this one image
    const currentIds = editor.getSelectedShapeIds()
    const newIds = currentIds.filter((id) => id !== imageId)
    editor.setSelectedShapes(newIds)
  }

  // Close model picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(event.target as Node)) {
        setShowModelPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[600px]">
        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-3 flex-wrap">
              {selectedImages.map((image) => (
                <div key={image.id} className="relative inline-block">
                  <img
                    src={image.src}
                    alt="Selected"
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeSelectedImage(image.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    title="移除"
                  >
                    <X className="w-3 h-3" weight="bold" />
                  </button>
                </div>
              ))}
              {selectedImages.length > 1 && (
                <button
                  onClick={clearSelectedImages}
                  className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="清除全部"
                >
                  清除全部
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-5 py-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={selectedImages.length > 0 ? "描述你想要的变化..." : "描述你想要生成的图片..."}
            className="w-full text-base bg-transparent border-none outline-none resize-none placeholder-gray-400 leading-relaxed"
            rows={2}
            disabled={isGenerating}
            style={{ minHeight: '56px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
        </div>

        {/* Bottom Bar: Model Selector + Generate Button */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          {/* Left: Status or hint */}
          <div className="flex-1">
            {isGenerating ? (
              <p className="text-sm text-gray-500">正在生成中...</p>
            ) : selectedImages.length > 0 ? (
              <p className="text-sm text-gray-500">
                已选择 {selectedImages.length} 张参考图
              </p>
            ) : null}
          </div>

          {/* Right: Model Selector + Generate Button */}
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative" ref={modelPickerRef}>
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                disabled={isGenerating}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`模型: ${currentModel.name}`}
              >
                <Cube className="w-5 h-5" weight="duotone" />
              </button>

              {/* Model Picker Dropdown */}
              {showModelPicker && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">选择模型</p>
                  </div>
                  <div className="py-1">
                    {IMAGE_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setCurrentModel(model)
                          setShowModelPicker(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          currentModel.id === model.id ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-800">{model.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                        </div>
                        {currentModel.id === model.id && (
                          <Check className="w-4 h-4 text-purple-600" weight="bold" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
              title="生成"
            >
              {isGenerating ? (
                <SpinnerGap className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" weight="bold" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
