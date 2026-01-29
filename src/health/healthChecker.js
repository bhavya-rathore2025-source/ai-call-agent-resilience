export function startHealthCheck({ serviceName, service, circuitBreaker, intervalMs = 5000 }) {
  setInterval(async () => {
    try {
      // Lightweight health check
      await service.healthCheck()

      if (circuitBreaker.getState() !== 'CLOSED') {
        circuitBreaker.recordSuccess()
        console.log(`[HEALTH] ${serviceName} recovered. Circuit breaker reset.`)
      }
    } catch (err) {
      // Do nothing – health checks should never crash the system
      console.log(`[HEALTH] ${serviceName} still unhealthy (${err.constructor.name})`)
    }
  }, intervalMs)
}
