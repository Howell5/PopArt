/// <reference types="vite/client" />

// CSS Module declarations
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_NEBULA_API_KEY: string
  readonly VITE_REPLICATE_API_KEY?: string
  readonly VITE_REMOVE_BG_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
