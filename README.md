# Robo - AI Canvas

An infinite canvas web app with AI image generation powered by ByteDance SeedDream 4.0 (火山方舟).

## Features

- ✅ Infinite canvas with smooth pan and zoom
- ✅ Drag and drop image upload
- ✅ AI image generation using ByteDance SeedDream 4.0 (火山方舟)
- ✅ Advanced prompt controls (negative prompts)
- 🚧 Image editing (upscale, background removal) - Coming in Stage 4
- 🚧 More features coming soon...

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Canvas SDK**: tldraw v2
- **AI Model**: ByteDance SeedDream 4.0 (火山方舟)
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- 火山方舟 API Key for SeedDream (for AI image generation)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd robo
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your 火山方舟 API key:
```bash
VITE_ARK_API_KEY=your_ark_api_key
```

**Get your API key**: [火山方舟控制台](https://console.volcengine.com/ark) (需要充值)

**Important**:
- ✅ Vite automatically loads `.env` files (no need for dotenv package)
- ✅ Only variables prefixed with `VITE_` are exposed to the browser
- ✅ Restart dev server after changing `.env` files

4. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

📖 **Need help?** See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Development

### Project Structure

```
robo/
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
- [x] Stage 3: AI image generation (SeedDream 4.0) ✅
- [ ] Stage 4: Image editing features (upscale, background removal)
- [ ] Stage 5: Optimization and polish

## Usage

### AI Image Generation

1. **Set up your API key**:
   - Get an API key from [火山方舟控制台](https://console.volcengine.com/ark) (需要充值)
   - Copy `.env.example` to `.env.local`
   - Add your API key: `VITE_ARK_API_KEY=your_key_here`

2. **Generate images**:
   - Enter your prompt in the AI Generate panel
   - (Optional) Add negative prompts for better control
   - Click "Generate with SeedDream"
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
- AI powered by [ByteDance SeedDream 4.0](https://www.volcengine.com/docs/82379/1824718) (火山方舟)
