import { TimeoutError, ServiceUnavailableError, InvalidPayloadError } from '../core/errors.js'

export class MockLLMService {
  constructor(mode = 'healthy') {
    this.mode = mode
  }

  setMode(mode) {
    this.mode = mode
  }

  async generateResponse(prompt) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    switch (this.mode) {
      case 'timeout':
        throw new TimeoutError('LLM request timed out')

      case 'unavailable':
        throw new ServiceUnavailableError('LLM service unavailable (503)')

      case 'invalid_payload':
        throw new InvalidPayloadError('Invalid prompt sent to LLM')

      case 'healthy':
      default:
        return `LLM_RESPONSE_FOR: ${prompt}`
    }
  }
  async healthCheck() {
    if (this.mode === 'healthy') {
      return true
    }
    throw new Error('LLM service unhealthy')
  }
}
