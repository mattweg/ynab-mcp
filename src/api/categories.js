/**
 * YNAB Categories API operations
 * Handles category listing, retrieval, and updates
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List all categories in a budget
 * @param {object} params - Parameters with email and budgetId
 * @returns {Promise<object>} List of categories grouped by category group
 */
async function listCategories(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Listing categories for budget ${params.budgetId} for ${params.email}`);
    
    try {
      // Implementation to be added
      return { message: "Categories listing not yet implemented" };
    } catch (error) {
      // Re-throw errors
      throw error;
    }
  });
}

/**
 * Get details of a specific category
 * @param {object} params - Parameters with email, budgetId, and categoryId
 * @returns {Promise<object>} Category details
 */
async function getCategory(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.categoryId) {
    throw new ValidationError('Category ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting category ${params.categoryId} for budget ${params.budgetId} for ${params.email}`);
    
    try {
      // Implementation to be added
      return { message: "Category retrieval not yet implemented" };
    } catch (error) {
      // Re-throw errors
      throw error;
    }
  });
}

/**
 * Update a category's budgeted amount for a month
 * @param {object} params - Parameters with email, budgetId, categoryId, month, and budgeted amount
 * @returns {Promise<object>} Updated category
 */
async function updateCategory(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.categoryId) {
    throw new ValidationError('Category ID parameter is required');
  }
  
  if (!params.month) {
    throw new ValidationError('Month parameter is required (format: YYYY-MM)');
  }
  
  if (params.budgeted === undefined) {
    throw new ValidationError('Budgeted amount parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Updating category ${params.categoryId} budget for ${params.month} to ${params.budgeted}`);
    
    try {
      // Implementation to be added
      return { message: "Category update not yet implemented" };
    } catch (error) {
      // Re-throw errors
      throw error;
    }
  });
}

module.exports = {
  listCategories,
  getCategory,
  updateCategory
};