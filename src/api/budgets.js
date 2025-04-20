/**
 * YNAB Budget API operations
 * Handles budget listing and retrieval
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List all budgets for an account
 * @param {object} params - Parameters with email identifier
 * @returns {Promise<object>} List of budgets
 */
async function listBudgets(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Listing budgets for ${params.email}`);
    
    const response = await ynabAPI.budgets.getBudgets();
    const budgets = response.data.budgets;
    
    // Format the response
    return {
      budgets: budgets.map(budget => ({
        id: budget.id,
        name: budget.name,
        last_modified_on: budget.last_modified_on,
        currency_format: budget.currency_format
          ? {
              iso_code: budget.currency_format.iso_code,
              example_format: budget.currency_format.example_format
            }
          : undefined,
        date_format: budget.date_format
          ? {
              format: budget.date_format.format
            }
          : undefined
      })),
      default_budget: response.data.default_budget
        ? response.data.default_budget.id
        : undefined
    };
  });
}

/**
 * Get details of a specific budget
 * @param {object} params - Parameters with email and budgetId
 * @returns {Promise<object>} Budget details
 */
async function getBudget(params) {
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
    logger.info(`Getting budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.budgets.getBudgetById(params.budgetId);
      const budget = response.data.budget;
      
      // Format the response to include essential budget information
      return {
        id: budget.id,
        name: budget.name,
        last_modified_on: budget.last_modified_on,
        date_format: budget.date_format,
        currency_format: budget.currency_format,
        accounts_count: budget.accounts ? budget.accounts.length : 0,
        categories_count: budget.categories ? budget.categories.length : 0,
        payees_count: budget.payees ? budget.payees.length : 0,
        months_count: budget.months ? budget.months.length : 0,
        server_knowledge: budget.server_knowledge
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(`Budget with ID ${params.budgetId} not found`);
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Get settings for a specific budget
 * @param {object} params - Parameters with email and budgetId
 * @returns {Promise<object>} Budget settings
 */
async function getBudgetSettings(params) {
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
    logger.info(`Getting settings for budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.budgets.getBudgetSettingsById(params.budgetId);
      return response.data.settings;
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(`Budget with ID ${params.budgetId} not found`);
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

module.exports = {
  listBudgets,
  getBudget,
  getBudgetSettings
};