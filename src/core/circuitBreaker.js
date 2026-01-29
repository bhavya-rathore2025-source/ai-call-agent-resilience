// Circuit breaker states
export const CIRCUIT_STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
}

export class CircuitBreaker {
  constructor(config) {
    this.failureThreshold = config.failureThreshold
    this.cooldownMs = config.cooldownMs

    this.state = CIRCUIT_STATE.CLOSED
    this.failureCount = 0
    this.lastFailureTime = null
  }

  canRequest() {
    if (this.state === CIRCUIT_STATE.OPEN) {
      const now = Date.now()
      if (now - this.lastFailureTime >= this.cooldownMs) {
        this.state = CIRCUIT_STATE.HALF_OPEN
        return true
      }
      return false // fail-fast
    }
    return true
  }

  recordSuccess() {
    this.failureCount = 0
    this.state = CIRCUIT_STATE.CLOSED
  }

  recordFailure() {
    this.failureCount += 1
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      this.state = CIRCUIT_STATE.OPEN
    }
  }

  getState() {
    return this.state
  }
}
