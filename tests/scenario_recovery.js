import { handleCall, services } from '../src/orchestrator.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runScenario() {
  console.log('\n--- Circuit Breaker Recovery Scenario ---\n')

  // Step 1: Force failures to open the circuit
  services.voiceService.setMode('timeout')

  console.log('Triggering failures to OPEN the circuit...\n')
  for (let i = 1; i <= 3; i++) {
    await handleCall(`Failure call ${i}`)
  }

  // Step 2: Wait for cooldown period
  console.log('\nWaiting for cooldown period...\n')
  await sleep(6000) // slightly more than cooldownMs

  // Step 3: Recover service
  services.voiceService.setMode('healthy')

  console.log('\nService recovered. Making test call...\n')
  await handleCall('Recovery test call')

  console.log('\n--- Recovery Scenario Complete ---\n')
}

await runScenario()
