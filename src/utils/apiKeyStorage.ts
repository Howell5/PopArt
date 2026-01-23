// API Key storage utility using localStorage

const STORAGE_KEY = 'popart-nebula-api-key'

/**
 * Get the Nebula API key from localStorage
 */
export const getNebulaApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Save the Nebula API key to localStorage
 */
export const setNebulaApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEY, apiKey)
}

/**
 * Check if the Nebula API key is configured
 */
export const hasNebulaApiKey = (): boolean => {
  const key = getNebulaApiKey()
  return key !== null && key.trim() !== ''
}

/**
 * Clear the Nebula API key from localStorage
 */
export const clearNebulaApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}
