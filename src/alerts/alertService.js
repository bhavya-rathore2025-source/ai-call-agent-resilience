export function sendAlert({ level, service, message }) {
  const alert = {
    timestamp: new Date().toISOString(),
    level, // INFO | WARNING | CRITICAL
    service, // VOICE | LLM | SYSTEM
    message,
  }

  // Simulated alert channels
  sendEmail(alert)
  sendTelegram(alert)
  sendWebhook(alert)
}

function sendEmail(alert) {
  console.log('[ALERT - EMAIL]', alert)
}

function sendTelegram(alert) {
  console.log('[ALERT - TELEGRAM]', alert)
}

function sendWebhook(alert) {
  console.log('[ALERT - WEBHOOK]', alert)
}
