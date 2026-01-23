# PopArt - AI Canvas

An infinite canvas web app with AI image generation (Gemini & Seedream models).

## Features

- ✅ Infinite canvas with smooth pan and zoom
- ✅ Drag and drop image upload
- ✅ AI image generation (Gemini & Seedream)
- ✅ Advanced prompt controls (negative prompts)
- 🚧 Image editing (upscale, background removal) - Coming in Stage 4
- 🚧 More features coming soon...

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Canvas SDK**: tldraw v2
- **AI Model**: Gemini & Seedream
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- API Key (for AI image generation)

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

The app will be available at `http://localhost:3000`

4. Configure API Key in the app settings (gear icon at bottom right)

## Development

### Project Structure

```
popart/
├── src/
│   ├── components/
│   │   ├── Canvas/          # Canvas-related components
│   │   ├── Toolbar/         # Toolbar components
│   │   └── UI/              # Shared UI components
│   ├── services/
│   │   └── ai/              # AI integration services
│   ├── stores/              # State management
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── public/
└── ...config files
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Roadmap

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed development stages.

- [x] Stage 1: Project setup and infrastructure ✅
- [x] Stage 2: Infinite canvas core features ✅
- [x] Stage 3: AI image generation ✅
- [ ] Stage 4: Image editing features (upscale, background removal)
- [ ] Stage 5: Optimization and polish

## Usage

### AI Image Generation

1. **Set up your API key**:
   - Click the gear icon at the bottom right
   - Enter your API key and save

2. **Generate images**:
   - Enter your prompt in the AI Generate panel
   - (Optional) Add negative prompts for better control
   - Select your preferred model (Gemini or Seedream)
   - Click "Generate"
   - Image will automatically be added to the canvas

3. **Keyboard shortcuts**:
   - `Cmd/Ctrl + Enter` - Generate image from prompt
   - `Cmd/Ctrl + +/-` - Zoom in/out
   - `Cmd/Ctrl + 0` - Reset zoom
   - `Cmd/Ctrl + D` - Duplicate selected images

## License

MIT

## Credits

- Built with [tldraw](https://tldraw.dev)
