// API Key storage utility using localStorage

const STORAGE_KEY = 'popart-api-key'

/**
 * Get the API key from localStorage
 */
export const getApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Save the API key to localStorage
 */
export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEY, apiKey)
}

/**
 * Check if the API key is configured
 */
export const hasApiKey = (): boolean => {
  const key = getApiKey()
  return key !== null && key.trim() !== ''
}

/**
 * Clear the API key from localStorage
 */
export const clearApiKey = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}
