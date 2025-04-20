/**
 * Error handler utility for YNAB MCP
 * Provides consistent error handling and messaging
 */

const { logger } = require('./logger');

// Custom error classes
class YnabMcpError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticationError extends YnabMcpError {
  constructor(message = 'Authentication failed', code = 'AUTH_ERROR') {
    super(message, 401, code);
  }
}

class TokenError extends YnabMcpError {
  constructor(message = 'Token error', code = 'TOKEN_ERROR') {
    super(message, 401, code);
  }
}

class RateLimitError extends YnabMcpError {
  constructor(message = 'Rate limit exceeded', code = 'RATE_LIMIT_ERROR') {
    super(message, 429, code);
  }
}

class ValidationError extends YnabMcpError {
  constructor(message = 'Validation failed', code = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

class NotFoundError extends YnabMcpError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND_ERROR') {
    super(message, 404, code);
  }
}

// Error handler function for API responses
const handleError = (error, req, res, next) => {
  // Log the error
  if (error instanceof YnabMcpError) {
    logger.warn(`${error.name}: ${error.message}`);
  } else {
    logger.error('Unhandled error:', error);
  }

  // Determine the status code and format error for response
  const statusCode = error.statusCode || 500;
  const errorResponse = {
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      status: statusCode
    }
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

// Format error for MCP response
const formatMcpError = (error) => {
  const baseError = {
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR'
    }
  };

  // Add additional context based on error type
  if (error instanceof AuthenticationError) {
    baseError.error.authenticationRequired = true;
  } else if (error instanceof RateLimitError) {
    baseError.error.retryAfter = error.retryAfter || 3600; // Default to 1 hour
  }

  return baseError;
};

module.exports = {
  YnabMcpError,
  AuthenticationError,
  TokenError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  handleError,
  formatMcpError
};