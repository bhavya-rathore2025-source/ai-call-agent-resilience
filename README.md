# Project Structure & Purpose

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

- Triggered on permanent failures or circuit breaker openings
- Can be extended to email, Telegram, or webhooks

---

## src/health/

### healthChecker.js

Supports service recovery.

- Works with the circuit breaker HALF-OPEN state
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
