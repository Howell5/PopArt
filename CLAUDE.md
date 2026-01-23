# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PopArt is an AI-powered infinite canvas web application for image generation and editing. It uses tldraw as the canvas SDK with Nebula API for AI image generation (Gemini & Seedream models).

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

### Core Stack
- **Canvas**: tldraw v2 - handles infinite canvas, pan/zoom, shape management, persistence
- **AI Image Generation**: Nebula API (Gemini & Seedream models)
- **State**: Zustand for AI generation state; tldraw manages canvas state with localStorage persistence
- **Styling**: TailwindCSS

### Key Architectural Decisions

1. **tldraw Integration**: The app uses tldraw's `TLComponents` system to inject custom UI (`InFrontOfTheCanvas`) for the floating toolbar and prompt panel. The `useEditor()` hook provides access to the tldraw editor instance.

2. **Image Assets**: All images are stored as base64 data URLs in tldraw's asset store (`src/utils/imageAssets.ts`). The `createImageAssetStore()` function handles image uploads and resolution.

3. **AI Services**: Located in `src/services/ai/`:
   - `imageGeneration.ts` - Nebula API (Gemini & Seedream models)
   - `backgroundRemoval.ts` - remove.bg API
   - `imageUpscale.ts` - Real-ESRGAN via Replicate

4. **UI Components**: Two main floating UI components:
   - `BottomPromptPanel` - AI generation input with model selection and reference image support
   - `FloatingToolbar` - Image actions (copy, download, upscale, remove background) positioned above selected image

### Data Flow for Image Generation

1. User enters prompt in `BottomPromptPanel`
2. `useAIStore.generateImage()` calls `imageGeneration.ts`
3. Base64 response converted to data URL
4. `addImageToCanvas()` creates tldraw asset + shape

### Environment Variables

Required in `.env.local`:
```
VITE_NEBULA_API_KEY=xxx      # Nebula API (required)
VITE_REPLICATE_API_KEY=xxx   # Real-ESRGAN upscale (optional)
VITE_REMOVE_BG_API_KEY=xxx   # remove.bg (optional)
```

## Code Patterns

### Working with tldraw Editor

```typescript
const editor = useEditor()

// Create image asset
editor.createAssets([{ id: assetId, type: 'image', ... }])

// Create image shape
editor.createShape({ type: 'image', x, y, props: { assetId, w, h } })

// Get selected shapes
editor.getSelectedShapes()

// Convert coordinates
editor.pageToScreen({ x, y })
editor.getViewportScreenCenter()
```

### Adding Images to Canvas

Use `addImageToCanvas()` from `src/utils/imageAssets.ts` - handles asset creation, dimension scaling, and positioning.
