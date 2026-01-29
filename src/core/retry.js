import { TransientError } from './errors.js'

// Utility sleep function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function retryWithBackoff(operation, config, onRetry) {
  const { initialDelayMs, backoffFactor, maxRetries } = config

  let attempt = 0
  let delay = initialDelayMs

  while (attempt <= maxRetries) {
    try {
      return await operation()
    } catch (error) {
      // Retry only transient errors
      if (!(error instanceof TransientError)) {
        throw error
      }

      if (attempt === maxRetries) {
        throw error
      }

      if (onRetry) {
        onRetry({
          attempt,
          delay,
          error,
        })
      }

      await sleep(delay)
      delay *= backoffFactor
      attempt++
    }
  }
}
