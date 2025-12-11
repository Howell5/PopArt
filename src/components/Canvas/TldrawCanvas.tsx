import { Tldraw, useEditor, TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import { createImageAssetStore, addImageToCanvas, isImageFile } from '../../utils/imageAssets'
import FloatingToolbar from '../UI/FloatingToolbar'
import BottomPromptPanel from '../UI/BottomPromptPanel'
import { useEffect } from 'react'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { Sparkle } from '@phosphor-icons/react'

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
        <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
          <Sparkle className="w-4 h-4 text-white" weight="fill" />
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
