// Base application error
export class AppError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

// Error Categories

export class TransientError extends AppError {}
export class PermanentError extends AppError {}

// Transient Errors

export class TimeoutError extends TransientError {}
export class ServiceUnavailableError extends TransientError {}
export class NetworkError extends TransientError {}

// --------------------
// Permanent Errors
// --------------------
export class AuthenticationError extends PermanentError {}
export class InvalidPayloadError extends PermanentError {}
export class QuotaExceededError extends PermanentError {}
