import fs from 'fs'
import path from 'path'
import { logToSheet } from './sheetLogger.js'

const LOG_DIR = path.resolve('logs')
const LOG_FILE = path.join(LOG_DIR, 'app.log')

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR)
}

export async function logEvent({ service, errorCategory, message, retryCount = 0, circuitState }) {
  const log = {
    timestamp: new Date().toISOString(),
    service,
    errorCategory,
    retryCount,
    circuitState,
    message,
  }

  // Local log
  fs.appendFileSync(LOG_FILE, JSON.stringify(log) + '\n')
  console.log('[LOG]', log)

  // Google Sheet log (non-blocking)
  await logToSheet(log)
}
