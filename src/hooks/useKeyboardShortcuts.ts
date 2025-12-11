import { useEffect } from 'react'
import { Editor } from 'tldraw'

export const useKeyboardShortcuts = (editor: Editor | null) => {
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Zoom in: Cmd/Ctrl + Plus or Cmd/Ctrl + =
      if (modifier && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        editor.zoomIn(editor.getViewportScreenCenter(), { animation: { duration: 220 } })
      }

      // Zoom out: Cmd/Ctrl + Minus
      if (modifier && e.key === '-') {
        e.preventDefault()
        editor.zoomOut(editor.getViewportScreenCenter(), { animation: { duration: 220 } })
      }

      // Reset zoom: Cmd/Ctrl + 0
      if (modifier && e.key === '0') {
        e.preventDefault()
        editor.resetZoom(editor.getViewportScreenCenter(), { animation: { duration: 220 } })
      }

      // Zoom to fit: Cmd/Ctrl + 1
      if (modifier && e.key === '1') {
        e.preventDefault()
        editor.zoomToFit({ animation: { duration: 220 } })
      }

      // Delete selected: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedShapes = editor.getSelectedShapes()
        if (selectedShapes.length > 0 && !e.repeat) {
          e.preventDefault()
          editor.deleteShapes(selectedShapes)
        }
      }

      // Select all: Cmd/Ctrl + A
      if (modifier && e.key === 'a') {
        e.preventDefault()
        editor.selectAll()
      }

      // Deselect all: Escape
      if (e.key === 'Escape') {
        editor.selectNone()
      }

      // Duplicate: Cmd/Ctrl + D
      if (modifier && e.key === 'd') {
        e.preventDefault()
        const selectedShapes = editor.getSelectedShapes()
        if (selectedShapes.length > 0) {
          editor.duplicateShapes(selectedShapes)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])
}
