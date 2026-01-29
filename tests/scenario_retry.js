import { handleCall, services } from '../src/orchestrator.js'

services.voiceService.setMode('timeout')

await handleCall('Test retry logic')
