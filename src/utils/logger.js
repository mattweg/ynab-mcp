/**
 * Logger utility for YNAB MCP
 * Provides consistent logging across the application
 */

const winston = require('winston');
const config = require('../../config-example');

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || config.server.logLevel || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
  // Don't exit on error
  exitOnError: false,
});

// Filter sensitive data from logs
const filterSensitiveData = (message) => {
  if (typeof message !== 'string') return message;
  
  // Filter out tokens, client secrets, etc.
  return message
    .replace(/("access_token":\s*)"[^"]*"/g, '$1"[FILTERED]"')
    .replace(/("refresh_token":\s*)"[^"]*"/g, '$1"[FILTERED]"')
    .replace(/("client_secret":\s*)"[^"]*"/g, '$1"[FILTERED]"')
    .replace(/Bearer [a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/g, 'Bearer [FILTERED]');
};

// Create a wrapped logger that filters sensitive data
const secureLogger = {
  error: (message, ...args) => logger.error(filterSensitiveData(message), ...args),
  warn: (message, ...args) => logger.warn(filterSensitiveData(message), ...args),
  info: (message, ...args) => logger.info(filterSensitiveData(message), ...args),
  verbose: (message, ...args) => logger.verbose(filterSensitiveData(message), ...args),
  debug: (message, ...args) => logger.debug(filterSensitiveData(message), ...args),
};

module.exports = { logger: secureLogger };