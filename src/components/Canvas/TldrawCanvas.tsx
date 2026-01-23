import { Tldraw, useEditor, TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import { createImageAssetStore, addImageToCanvas, isImageFile, addDefaultImageToCanvas } from '../../utils/imageAssets'
import FloatingToolbar from '../UI/FloatingToolbar'
import BottomPromptPanel from '../UI/BottomPromptPanel'
import SettingsModal from '../UI/SettingsModal'
import GeneratingOverlay from '../UI/GeneratingOverlay'
import { useEffect, useState, useMemo } from 'react'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { hasNebulaApiKey } from '../../utils/apiKeyStorage'
import { Gear } from '@phosphor-icons/react'

// Default image URL - Cézanne's "A Painter at Work"
const DEFAULT_IMAGE_URL = '/default-image.jpg'

// Key for localStorage to track if default image was loaded
const DEFAULT_IMAGE_LOADED_KEY = 'popart-default-image-loaded'

// Global event emitter for settings modal
let openSettingsCallback: (() => void) | null = null

export const openSettings = () => {
  openSettingsCallback?.()
}

// Component to handle drag and drop and keyboard shortcuts
function DropHandler() {
  const editor = useEditor()

  // Add keyboard shortcuts
  useKeyboardShortcuts(editor)

  // Load default image on first visit
  useEffect(() => {
    const hasLoadedDefault = localStorage.getItem(DEFAULT_IMAGE_LOADED_KEY)
    const hasExistingShapes = editor.getCurrentPageShapes().length > 0

    // Only add default image if this is a fresh start (no shapes and never loaded)
    if (!hasLoadedDefault && !hasExistingShapes) {
      addDefaultImageToCanvas(editor, DEFAULT_IMAGE_URL)
      localStorage.setItem(DEFAULT_IMAGE_LOADED_KEY, 'true')
    }
  }, [editor])

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
      <GeneratingOverlay />
      {/* Floating Logo - positioned to align with tldraw menu bar */}
      <div className="fixed top-[18px] left-4 z-[200] flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-gray-200">
        <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
          <svg
            width="24"
            height="24"
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
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              transform="rotate(-15, 50, 50)"
            />
            <path d="M72 22 L75 30 L83 33 L75 36 L72 44 L69 36 L61 33 L69 30 Z" fill="#818CF8" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-700">PopArt</span>
      </div>
      {/* Settings button - positioned at bottom right */}
      <button
        onClick={() => openSettings()}
        className="fixed bottom-4 right-4 z-[200] p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        title="设置"
      >
        <Gear size={18} className="text-gray-500" />
      </button>
    </>
  )
}

// Stable components configuration - defined outside component to prevent recreation
const components: TLComponents = {
  InFrontOfTheCanvas: InFrontOfTheCanvas,
}

export default function TldrawCanvas() {
  const assetStore = useMemo(() => createImageAssetStore(), [])
  const [showSettings, setShowSettings] = useState(false)
  const [needsApiKey, setNeedsApiKey] = useState(false)

  // Register the callback for opening settings
  useEffect(() => {
    openSettingsCallback = () => setShowSettings(true)
    return () => {
      openSettingsCallback = null
    }
  }, [])

  // Check if API key is configured on mount
  useEffect(() => {
    if (!hasNebulaApiKey()) {
      setNeedsApiKey(true)
      setShowSettings(true)
    }
  }, [])

  const handleCloseSettings = () => {
    setShowSettings(false)
    // After closing, check if key was set
    if (hasNebulaApiKey()) {
      setNeedsApiKey(false)
    }
  }

  return (
    <div className="w-full h-full relative tldraw-layout-custom">
      <Tldraw
        assets={assetStore}
        components={components}
        persistenceKey="popart-canvas" // Enable localStorage persistence
      >
        <DropHandler />
      </Tldraw>
      <SettingsModal
        isOpen={showSettings}
        onClose={handleCloseSettings}
        required={needsApiKey}
      />
    </div>
  )
}
