import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, TLImageShape } from 'tldraw'
import {
  useAIStore,
  IMAGE_MODELS,
  GEMINI_ASPECT_RATIOS,
  GEMINI_IMAGE_SIZES,
  SEEDREAM_SIZES_2K,
  type GeminiImageSize,
} from '../../stores/useAIStore'
import { addImageToCanvas } from '../../utils/imageAssets'
import { X, ArrowRight, SpinnerGap, CaretDown, Check } from '@phosphor-icons/react'

interface SelectedImage {
  id: string
  src: string
}

// Dropdown component for selecting options
function Dropdown<T extends string>({
  value,
  options,
  onChange,
  disabled,
  renderLabel,
}: {
  value: T
  options: readonly { value: T; label: string; description?: string }[]
  onChange: (value: T) => void
  disabled?: boolean
  renderLabel?: (option: { value: T; label: string; description?: string }) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => o.value === value)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{selectedOption?.label || value}</span>
        <CaretDown className="w-3.5 h-3.5" weight="bold" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 min-w-[140px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="py-1 max-h-[240px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors ${
                  value === option.value ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex-1 text-left">
                  {renderLabel ? (
                    renderLabel(option)
                  ) : (
                    <>
                      <div className="text-sm text-gray-800">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500">{option.description}</div>
                      )}
                    </>
                  )}
                </div>
                {value === option.value && (
                  <Check className="w-4 h-4 text-purple-600" weight="bold" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function BottomPromptPanel() {
  const editor = useEditor()
  const {
    isGenerating,
    generateImage,
    currentModel,
    setCurrentModel,
    geminiAspectRatio,
    setGeminiAspectRatio,
    geminiImageSize,
    setGeminiImageSize,
    seedreamSize,
    setSeedreamSize,
  } = useAIStore()
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

  const isGemini = currentModel.provider === 'gemini'

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[640px]">
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

        {/* Bottom Bar: Options + Generate Button */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          {/* Left: Model Selector + Size Options */}
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <div className="relative" ref={modelPickerRef}>
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{currentModel.name}</span>
                <CaretDown className="w-3.5 h-3.5" weight="bold" />
              </button>

              {/* Model Picker Dropdown */}
              {showModelPicker && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
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

            {/* Aspect Ratio / Size Selector */}
            {isGemini ? (
              <>
                {/* Gemini: Aspect Ratio */}
                <Dropdown
                  value={geminiAspectRatio}
                  options={GEMINI_ASPECT_RATIOS}
                  onChange={setGeminiAspectRatio}
                  disabled={isGenerating}
                />
                {/* Gemini: Image Size */}
                <Dropdown
                  value={geminiImageSize}
                  options={GEMINI_IMAGE_SIZES}
                  onChange={(v) => setGeminiImageSize(v as GeminiImageSize)}
                  disabled={isGenerating}
                />
              </>
            ) : (
              /* Seedream: Size (includes aspect ratio) */
              <Dropdown
                value={seedreamSize}
                options={SEEDREAM_SIZES_2K}
                onChange={setSeedreamSize}
                disabled={isGenerating}
                renderLabel={(option) => (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-400">{option.description}</span>
                    )}
                  </div>
                )}
              />
            )}
          </div>

          {/* Right: Status + Generate Button */}
          <div className="flex items-center gap-3">
            {/* Status */}
            {isGenerating ? (
              <p className="text-sm text-gray-500">正在生成中...</p>
            ) : selectedImages.length > 0 ? (
              <p className="text-sm text-gray-500">
                已选择 {selectedImages.length} 张参考图
              </p>
            ) : null}

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
