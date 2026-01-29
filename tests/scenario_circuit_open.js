import { handleCall, services } from '../src/orchestrator.js'

async function runScenario() {
  console.log('\n--- Circuit Breaker OPEN Scenario ---\n')

  // Force voice service to fail every time
  services.voiceService.setMode('timeout')

  // Make multiple calls to trigger circuit breaker
  for (let i = 1; i <= 4; i++) {
    console.log(`\nCall attempt ${i}`)
    await handleCall(`Test call ${i}`)
  }

  console.log('\n--- Scenario Complete ---\n')
}

await runScenario()
