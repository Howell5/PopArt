# PopArt

An AI-powered infinite canvas web application for image generation and creative workflows. Built with React, TypeScript, and tldraw.

![PopArt](https://img.shields.io/badge/version-0.1.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

PopArt combines an infinite canvas experience with AI image generation capabilities. Create, organize, and iterate on AI-generated images in a fluid, visual workspace.

## Features

### Core Canvas
- **Infinite Canvas**: Smooth pan and zoom navigation powered by tldraw
- **Drag & Drop**: Import local images directly onto the canvas
- **Image Management**: Select, move, resize, and rotate images freely
- **Auto-persistence**: Canvas state automatically saved to localStorage

### AI Image Generation
- **Multiple Models**: Support for Gemini (Nano Banana, Nano Banana Pro) and Seedream (4.0, 4.5) models
- **Text-to-Image**: Generate images from text prompts
- **Image-to-Image**: Use existing images as references for generation
- **Configurable Output**: Choose aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3) and quality (1K, 2K, 4K)
- **Concurrent Generation**: Generate up to 5 images simultaneously
- **Smart Placement**: New images automatically positioned to avoid overlaps

### User Interface
- **Floating Toolbar**: Quick actions (copy, download, info) for selected images
- **Bottom Prompt Panel**: Centered input panel with model/size selection
- **Image Metadata**: View generation details including prompt, model, and timestamp
- **Onboarding Guide**: First-time user tutorial with example content

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Canvas | tldraw v2 |
| State Management | Zustand |
| Styling | TailwindCSS |
| Build Tool | Vite |
| Icons | Phosphor Icons |
| AI Integration | OpenAI-compatible API (Gemini, Seedream) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- API Key for image generation

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd popart
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

4. Configure your API key via the settings modal (gear icon at bottom right)

### Environment Variables (Optional)

You can also configure API keys via environment variables:

```bash
# .env.local
VITE_API_KEY=your_api_key_here
VITE_REPLICATE_API_KEY=your_replicate_key_here    # For image upscaling
VITE_REMOVE_BG_API_KEY=your_remove_bg_key_here    # For background removal
```

## Project Structure

```
popart/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   └── TldrawCanvas.tsx    # Main canvas component
│   │   └── UI/
│   │       ├── BottomPromptPanel.tsx   # AI generation input
│   │       ├── FloatingToolbar.tsx     # Selected image actions
│   │       ├── GeneratingOverlay.tsx   # Loading state overlay
│   │       └── SettingsModal.tsx       # API key configuration
│   ├── services/
│   │   └── ai/
│   │       └── imageGeneration.ts  # AI API integration
│   ├── stores/
│   │   └── useAIStore.ts           # Zustand store for AI state
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts # Keyboard shortcut handlers
│   ├── utils/
│   │   ├── imageAssets.ts          # Image asset management
│   │   ├── apiKeyStorage.ts        # API key persistence
│   │   └── onboarding.ts           # First-time user guide
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Usage Guide

### Generating Images

1. **Configure API Key**: Click the gear icon at bottom right and enter your API key
2. **Enter Prompt**: Type your image description in the bottom panel
3. **Select Model**: Choose between Gemini or Seedream models
4. **Choose Settings**: Select aspect ratio and quality
5. **Generate**: Press Enter or click the arrow button

### Image-to-Image Generation

1. Select one or more images on the canvas
2. Enter a prompt describing the desired changes
3. Generate - the selected images will be used as references

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Generate image from prompt |
| `Cmd/Ctrl + D` | Duplicate selected images |
| `Cmd/Ctrl + +/-` | Zoom in/out |
| `Cmd/Ctrl + 0` | Reset zoom |
| `Delete/Backspace` | Delete selected |

## Architecture

### Data Flow

1. User enters prompt in `BottomPromptPanel`
2. `useAIStore.generateImage()` calls `imageGeneration.ts`
3. Placeholder shape created on canvas during generation
4. API response (base64) converted to data URL
5. Placeholder updated with actual image via `updatePlaceholderWithImage()`

### tldraw Integration

The app uses tldraw's `TLComponents` system to inject custom UI overlays:
- Custom `InFrontOfTheCanvas` component for floating UI elements
- Asset store for managing image data URLs
- Editor hooks for canvas manipulation

## Roadmap

- [x] Project infrastructure (Vite, React, TypeScript, TailwindCSS)
- [x] Infinite canvas with tldraw
- [x] AI image generation (Gemini & Seedream)
- [x] Image-to-image generation
- [x] Floating toolbar with image actions
- [ ] Image upscaling (Real-ESRGAN via Replicate)
- [ ] Background removal (remove.bg API)
- [ ] Performance optimization for large canvases
- [ ] Export/import canvas functionality

## License

MIT

## Acknowledgments

- [tldraw](https://tldraw.dev) - Infinite canvas SDK
- [Phosphor Icons](https://phosphoricons.com) - Icon library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
