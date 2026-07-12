/**
 * Base service configuration for AssetFlow frontend.
 * Simulates real-world API requests with configurable delays.
 */

// Default delay is 500ms, but can be overridden by environment variables if defined.
export const API_DELAY_MS = Number(import.meta.env.VITE_API_DELAY_MS) || 500

/**
 * Simulates a promise resolver delay.
 * @param ms Delay time in milliseconds (falls back to API_DELAY_MS)
 */
export const simulateApiDelay = (ms?: number): Promise<void> => {
  const delayTime = ms !== undefined ? ms : API_DELAY_MS
  return new Promise((resolve) => setTimeout(resolve, delayTime))
}
