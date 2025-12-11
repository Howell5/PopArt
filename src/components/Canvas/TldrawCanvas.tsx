import { Tldraw, useEditor, TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import { createImageAssetStore, addImageToCanvas, isImageFile } from '../../utils/imageAssets'
import FloatingToolbar from '../UI/FloatingToolbar'
import BottomPromptPanel from '../UI/BottomPromptPanel'
import { useEffect } from 'react'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
// import { Sparkle } from '@phosphor-icons/react'

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
          {/* <Sparkle className="w-4 h-4 text-white" weight="fill" /> */}
          {/* <svg
            width="200"
            height="200"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="#0F172A" rx="20" />

            <rect x="28" y="25" width="14" height="50" rx="2" fill="white" />

            <circle cx="62" cy="40" r="16" stroke="white" stroke-width="8" />

            <circle cx="62" cy="40" r="5" fill="#6366F1" />
          </svg> */}
          <svg
            width="200"
            height="200"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="popGradient1" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="100%" stopColor="#A5B4FC" stopOpacity="1" />
              </linearGradient>
            </defs>

            <rect width="100" height="100" fill="#0F172A" rx="20" />

            <path
              d="M65 35 A 22 22 0 1 0 72 45"
              stroke="url(#popGradient1)"
              stroke-width="8"
              stroke-linecap="round"
              fill="none"
              transform="rotate(-15, 50, 50)"
            />

            <path d="M72 22 L75 30 L83 33 L75 36 L72 44 L69 36 L61 33 L69 30 Z" fill="#818CF8" />
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
