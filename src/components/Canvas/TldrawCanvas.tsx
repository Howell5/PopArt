import { Tldraw, useEditor, TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import { createImageAssetStore, addImageToCanvas, isImageFile } from '../../utils/imageAssets'
import FloatingToolbar from '../UI/FloatingToolbar'
import BottomPromptPanel from '../UI/BottomPromptPanel'
import { useEffect } from 'react'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'

// Component to handle drag and drop and keyboard shortcuts
function DropHandler() {
  const editor = useEditor()

  // Add keyboard shortcuts
  useKeyboardShortcuts(editor)

  useEffect(() => {
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer?.files || [])
      const imageFiles = files.filter(isImageFile)

      for (const file of imageFiles) {
        try {
          await addImageToCanvas(editor, file)
        } catch (error) {
          console.error('Failed to add image:', error)
        }
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    // Add event listeners to the editor container
    const container = editor.getContainer()
    container.addEventListener('drop', handleDrop)
    container.addEventListener('dragover', handleDragOver)

    return () => {
      container.removeEventListener('drop', handleDrop)
      container.removeEventListener('dragover', handleDragOver)
    }
  }, [editor])

  return null
}

// Component rendered in front of the canvas (highest z-index)
function InFrontOfTheCanvas() {
  return (
    <>
      <FloatingToolbar />
      <BottomPromptPanel />
      {/* Floating Logo */}
      <div className="fixed top-4 left-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm border border-gray-200/50">
        <div className="w-7 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-800">PopArt</span>
      </div>
    </>
  )
}

// Custom tldraw components configuration
const components: TLComponents = {
  InFrontOfTheCanvas: InFrontOfTheCanvas,
}

export default function TldrawCanvas() {
  const assetStore = createImageAssetStore()

  return (
    <div className="w-full h-full relative tldraw-layout-custom">
      <Tldraw
        assets={assetStore}
        components={components}
        persistenceKey="popart-canvas" // Enable localStorage persistence
      >
        <DropHandler />
      </Tldraw>
    </div>
  )
}
