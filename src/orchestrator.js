import { retryWithBackoff } from './core/retry.js'
import { CircuitBreaker } from './core/circuitBreaker.js'
import { TransientError, PermanentError } from './core/errors.js'
import { sendAlert } from './alerts/alertService.js'
import { startHealthCheck } from './health/healthChecker.js'
import { MockVoiceService } from './services/mockVoiceService.js'
import { MockLLMService } from './services/mockLLMService.js'
import { logEvent } from './logging/logger.js'
import { loadConfig } from './core/configLoader.js'

const retryConfig = loadConfig('config/retryConfig.json')
const circuitConfig = loadConfig('config/circuitConfig.json')

// Initialize services
const voiceService = new MockVoiceService()
const llmService = new MockLLMService()

// Circuit breakers (per service)
const voiceCircuit = new CircuitBreaker(circuitConfig)
const llmCircuit = new CircuitBreaker(circuitConfig)
startHealthCheck({
  serviceName: 'VOICE',
  service: voiceService,
  circuitBreaker: voiceCircuit,
  intervalMs: 5000,
})

startHealthCheck({
  serviceName: 'LLM',
  service: llmService,
  circuitBreaker: llmCircuit,
  intervalMs: 5000,
})

export async function handleCall(prompt) {
  // ---- LLM STEP ----
  if (!llmCircuit.canRequest()) {
    logEvent({
      service: 'LLM',
      errorCategory: 'CIRCUIT_OPEN',
      message: 'LLM circuit open, skipping call',
      circuitState: llmCircuit.getState(),
    })
    return
  }

  let llmResponse
  try {
    llmResponse = await retryWithBackoff(
      () => llmService.generateResponse(prompt),
      retryConfig,
      ({ attempt, error }) =>
        logEvent({
          service: 'LLM',
          errorCategory: error.constructor.name,
          message: error.message,
          retryCount: attempt,
          circuitState: llmCircuit.getState(),
        }),
    )
    llmCircuit.recordSuccess()
  } catch (error) {
    llmCircuit.recordFailure()

    logEvent({
      service: 'LLM',
      errorCategory: error.constructor.name,
      message: 'LLM failed permanently',
      circuitState: llmCircuit.getState(),
    })
    sendAlert({
      level: 'CRITICAL',
      service: 'LLM',
      message: 'LLM failed permanently. Call marked as failed.',
    })

    if (error instanceof PermanentError) return
  }

  // ---- VOICE STEP ----
  if (!voiceCircuit.canRequest()) {
    logEvent({
      service: 'VOICE',
      errorCategory: 'CIRCUIT_OPEN',
      message: 'Voice circuit open, using fallback',
      circuitState: voiceCircuit.getState(),
    })
    return
  }

  try {
    await retryWithBackoff(
      () => voiceService.speak(llmResponse),
      retryConfig,
      ({ attempt, error }) =>
        logEvent({
          service: 'VOICE',
          errorCategory: error.constructor.name,
          message: error.message,
          retryCount: attempt,
          circuitState: voiceCircuit.getState(),
        }),
    )
    voiceCircuit.recordSuccess()
  } catch (error) {
    voiceCircuit.recordFailure()
    if (voiceCircuit.getState() === 'OPEN') {
      sendAlert({
        level: 'WARNING',
        service: 'VOICE',
        message: 'Circuit breaker opened for voice service.',
      })
    }

    logEvent({
      service: 'VOICE',
      errorCategory: error.constructor.name,
      message: 'Voice service failed after retries',
      retryCount: retryConfig.maxRetries,
      circuitState: voiceCircuit.getState(),
    })
    sendAlert({
      level: 'CRITICAL',
      service: 'VOICE',
      message: 'Voice service failed after retries. Call marked as failed.',
    })
  }
}

// Expose services for test scenarios
export const services = {
  voiceService,
  llmService,
}
