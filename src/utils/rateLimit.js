/**
 * Rate limit handling for YNAB API
 * YNAB API has a limit of 200 requests per hour per token
 */

const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./logger');
const { RateLimitError } = require('./errorHandler');

class RateLimiter {
  constructor(options = {}) {
    this.requestCounts = {};
    this.resetInterval = options.resetInterval || 3600000; // 1 hour in milliseconds
    this.limit = options.limit || 200; // YNAB limit is 200 requests per hour
    this.bufferPercentage = options.bufferPercentage || 10; // Keep 10% buffer for critical operations
    this.effectiveLimit = Math.floor(this.limit * (100 - this.bufferPercentage) / 100);
    this.storePath = options.storePath || path.join(process.cwd(), 'data', 'rate-limits.json');
    this.persistenceEnabled = options.persistenceEnabled !== false;
    
    // Create the directory if it doesn't exist
    if (this.persistenceEnabled) {
      const dir = path.dirname(this.storePath);
      fs.ensureDirSync(dir);
      this.loadState();
    }
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Every minute
  }
  
  loadState() {
    try {
      if (fs.existsSync(this.storePath)) {
        const data = fs.readFileSync(this.storePath, 'utf8');
        this.requestCounts = JSON.parse(data);
        logger.debug('Rate limiter state loaded from disk');
      }
    } catch (error) {
      logger.warn('Failed to load rate limiter state:', error);
    }
  }
  
  saveState() {
    if (!this.persistenceEnabled) return;
    
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(this.requestCounts, null, 2));
      logger.debug('Rate limiter state saved to disk');
    } catch (error) {
      logger.warn('Failed to save rate limiter state:', error);
    }
  }
  
  canMakeRequest(accountId, priority = 'normal') {
    const now = Date.now();
    
    if (!this.requestCounts[accountId]) {
      this.requestCounts[accountId] = {
        count: 0,
        resetTime: now + this.resetInterval
      };
    }
    
    const account = this.requestCounts[accountId];
    
    // Reset counter if the hour has passed
    if (now > account.resetTime) {
      account.count = 0;
      account.resetTime = now + this.resetInterval;
    }
    
    // For high priority requests, use full limit
    const limitToUse = priority === 'high' ? this.limit : this.effectiveLimit;
    
    return account.count < limitToUse;
  }
  
  incrementCounter(accountId) {
    if (this.requestCounts[accountId]) {
      this.requestCounts[accountId].count++;
      this.saveState();
    }
  }
  
  decrementCounter(accountId) {
    if (this.requestCounts[accountId] && this.requestCounts[accountId].count > 0) {
      this.requestCounts[accountId].count--;
      this.saveState();
    }
  }
  
  getRemainingRequests(accountId, priority = 'normal') {
    if (!this.requestCounts[accountId]) {
      return priority === 'high' ? this.limit : this.effectiveLimit;
    }
    
    const limitToUse = priority === 'high' ? this.limit : this.effectiveLimit;
    return Math.max(0, limitToUse - this.requestCounts[accountId].count);
  }
  
  getResetTime(accountId) {
    if (!this.requestCounts[accountId]) {
      return Date.now() + this.resetInterval;
    }
    
    return this.requestCounts[accountId].resetTime;
  }
  
  cleanupExpiredEntries() {
    const now = Date.now();
    let changed = false;
    
    Object.keys(this.requestCounts).forEach(accountId => {
      if (now > this.requestCounts[accountId].resetTime) {
        this.requestCounts[accountId].count = 0;
        this.requestCounts[accountId].resetTime = now + this.resetInterval;
        changed = true;
      }
    });
    
    if (changed && this.persistenceEnabled) {
      this.saveState();
    }
  }
  
  async executeWithRateLimit(accountId, func, priority = 'normal') {
    if (!this.canMakeRequest(accountId, priority)) {
      const resetTime = new Date(this.getResetTime(accountId));
      const resetInMinutes = Math.ceil((resetTime - new Date()) / 60000);
      throw new RateLimitError(
        `Rate limit exceeded for ${accountId}. Resets in ${resetInMinutes} minutes.`,
        'RATE_LIMIT_EXCEEDED'
      );
    }
    
    this.incrementCounter(accountId);
    
    try {
      return await func();
    } catch (error) {
      // If the error is a 429 from YNAB API, adjust our rate limiter
      if (error.response && error.response.status === 429) {
        // Force reset the counter to match YNAB's tracking
        this.requestCounts[accountId].count = this.limit;
        this.saveState();
        
        // Extract retry-after header if available
        const retryAfter = error.response.headers['retry-after'] || 3600;
        const resetInSeconds = parseInt(retryAfter, 10);
        
        throw new RateLimitError(
          `YNAB API rate limit exceeded. Retry after ${resetInSeconds} seconds.`,
          'YNAB_RATE_LIMIT_EXCEEDED'
        );
      }
      
      throw error;
    }
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

module.exports = { RateLimiter, rateLimiter };