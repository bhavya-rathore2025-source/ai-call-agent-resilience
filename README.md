
# Project Structure & Purpose
Note:

MockVoiceService simulates a third-party voice API such as ElevenLabs.

MockLLMService simulates an external LLM provider.

No real external APIs are called; failures are intentionally simulated.

This allows deterministic testing of retries, circuit breakers, alerts, and recovery.

## src/core/

### errors.js

Defines a custom exception hierarchy to classify failures.

- Separates Transient and Permanent errors
- Enables intelligent retry and fail-fast behavior

---

### retry.js

Implements retry logic with exponential backoff.

- Retries only transient errors
- Uses configurable delay, backoff factor, and retry limits

---

### circuitBreaker.js

Implements the Circuit Breaker pattern.

- Manages CLOSED / OPEN / HALF-OPEN states
- Prevents cascading failures by failing fast when a service is unhealthy

---

## src/services/

### mockVoiceService.js

Simulates a third-party voice API (e.g., ElevenLabs).

- Can be forced to fail (timeout, 503, auth error)
- Used to test resilience behavior deterministically

---

### mockLLMService.js

Simulates an LLM provider.

- Supports transient and permanent failure modes
- Allows independent testing of LLM-related failures

---

## src/logging/

### logger.js

Handles structured logging.

- Writes logs to a local file
- Forwards logs to Google Sheets for non-technical visibility

---

### sheetLogger.js

Logs system events to Google Sheets.

- Uses a service account
- Runs non-blocking to avoid impacting core execution

---

## src/alerts/

### alertService.js

Handles critical alerts.

- Triggered when retries are exhausted or circuit breaker openings
- Can be extended to email, Telegram, or webhooks

---

## src/health/

### healthChecker.js

Supports service recovery.

- Periodically checks the health of external services
- Allows automatic return to normal operation

---

## src/orchestrator.js

Acts as the central coordinator.

- Calls external services
- Applies retry and circuit breaker logic
- Logs events and triggers alerts
- Ensures graceful degradation

---

## tests/

### scenario_retry.js

Demonstrates retry with exponential backoff for transient errors.

---

### scenario_circuit_open.js

Demonstrates circuit breaker opening and fail-fast behavior.

---

### scenario_recovery.js

Demonstrates automatic recovery after service health is restored.

---

# Error Flow

1. A service call fails
2. Error is classified using the custom exception hierarchy
3. Transient errors trigger retry logic
4. Permanent errors fail immediately
5. All events are logged
6. Critical failures trigger alerts

---

# Retry & Circuit Breaker Behavior

- Transient errors are retried using exponential backoff
- Retry attempts are capped to prevent overload
- Repeated call failures open the circuit breaker
- Open circuits fail fast without retries
- After cooldown, HALF-OPEN state tests recovery
- Successful calls reset the circuit to CLOSED

---

# Alerting Logic

Alerts are triggered when:

- A call permanently fails
- A circuit breaker opens
- A dependency remains unavailable beyond a threshold

Alerts notify administrators while ensuring the system continues running.

## How to Run the Program

1. Install dependencies:

```bash
npm install

2. Configure Google Sheets logging:

 ->Place service account credentials in config/googleCredentials.json

 ->Share the Google Sheet with the service account email

 ->Place google sheet id in logging/sheetLogger

3. Run any test scenario:

node tests/scenario_retry.js
node tests/scenario_circuit_open.js
node tests/scenario_recovery.js
```
