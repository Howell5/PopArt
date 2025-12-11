import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, TLImageShape } from 'tldraw'
import { useAIStore, IMAGE_MODELS } from '../../stores/useAIStore'
import { addImageToCanvas } from '../../utils/imageAssets'
import { X, ArrowRight, SpinnerGap, CaretDown, Check } from '@phosphor-icons/react'

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
      // Generate image with prompt
      const dataUrl = await generateImage(prompt)

      // Convert data URL to File
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], 'generated-image.png', { type: 'image/png' })

      // Add to canvas
      await addImageToCanvas(editor, file)

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
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden min-w-[500px] max-w-[700px]">
        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedImages.map((image) => (
                <div key={image.id} className="relative inline-block">
                  <img
                    src={image.src}
                    alt="Selected"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeSelectedImage(image.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                    title="Remove from selection"
                  >
                    <X className="w-3 h-3" weight="bold" />
                  </button>
                </div>
              ))}
              {selectedImages.length > 1 && (
                <button
                  onClick={clearSelectedImages}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Clear all selections"
                >
                  清除全部
                </button>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-3 p-4">
          {/* Model Selector */}
          <div className="relative" ref={modelPickerRef}>
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Select model"
            >
              <span className="font-medium">{currentModel.name}</span>
              <CaretDown className="w-3.5 h-3.5" weight="bold" />
            </button>

            {/* Model Picker Dropdown */}
            {showModelPicker && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="py-1">
                  {IMAGE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setCurrentModel(model)
                        setShowModelPicker(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-800">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.description}</div>
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

          <div className="flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={selectedImages.length > 0 ? "描述你想要的变化..." : "描述你想要生成的图片..."}
              className="w-full px-4 py-3 text-base bg-transparent border-none outline-none resize-none placeholder-gray-400"
              rows={1}
              disabled={isGenerating}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
            title="Generate"
          >
            {isGenerating ? (
              <SpinnerGap className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" weight="bold" />
            )}
          </button>
        </div>

        {/* Hint */}
        {isGenerating && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-500">正在生成中，请稍候...</p>
          </div>
        )}
      </div>
    </div>
  )
}
