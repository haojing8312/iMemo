import { ZodError } from 'zod'

/**
 * Configuration Validation Error
 * Thrown when JSON configuration fails Zod schema validation
 */
export class ConfigValidationError extends Error {
  constructor(public errors: ZodError) {
    super('Configuration validation failed')
    this.name = 'ConfigValidationError'

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigValidationError)
    }
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string[] {
    return this.errors.errors.map(err =>
      `${err.path.join('.')}: ${err.message}`
    )
  }
}

/**
 * Not Found Error
 * Thrown when a requested entity doesn't exist
 */
export class NotFoundError extends Error {
  constructor(
    public entityType: string,
    public id: string
  ) {
    super(`${entityType} with id "${id}" not found`)
    this.name = 'NotFoundError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError)
    }
  }
}

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string
  ) {
    super(`Validation failed for ${field}: ${message}`)
    this.name = 'ValidationError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }
  }
}

/**
 * File System Error
 * Thrown when file system operations fail
 */
export class FileSystemError extends Error {
  constructor(
    public operation: string,
    public path: string,
    public cause: Error
  ) {
    super(`File system ${operation} failed for ${path}: ${cause.message}`)
    this.name = 'FileSystemError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileSystemError)
    }
  }
}

/**
 * Generation Error
 * Thrown when image generation fails for a specific style
 */
export class GenerationError extends Error {
  constructor(
    public styleId: string,
    public cause: Error
  ) {
    super(`Image generation failed for style "${styleId}": ${cause.message}`)
    this.name = 'GenerationError'

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GenerationError)
    }
  }
}
