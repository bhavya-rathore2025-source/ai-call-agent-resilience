import { TimeoutError, ServiceUnavailableError, AuthenticationError } from '../core/errors.js'

export class MockVoiceService {
  constructor(mode = 'healthy') {
    this.mode = mode
  }

  setMode(mode) {
    this.mode = mode
  }

  async speak(text) {
    // Simulate async network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    switch (this.mode) {
      case 'timeout':
        throw new TimeoutError('Voice service timed out')

      case 'unavailable':
        throw new ServiceUnavailableError('Voice service unavailable (503)')

      case 'auth_error':
        throw new AuthenticationError('Invalid API key for voice service')

      case 'healthy':
      default:
        return `AUDIO_DATA_FOR: ${text}`
    }
  }
  async healthCheck() {
    if (this.mode === 'healthy') {
      return true
    }
    throw new Error('Voice service unhealthy')
  }
}
