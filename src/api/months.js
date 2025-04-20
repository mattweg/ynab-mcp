/**
 * YNAB Month API operations
 * Handles budget month listing and retrieval
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List all months in a budget
 * @param {object} params - Parameters with email and budgetId
 * @returns {Promise<object>} List of months
 */
async function listMonths(params) {
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
    logger.info(`Listing months for budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.months.getBudgetMonths(params.budgetId);
      const months = response.data.months;
      
      // Format the response
      return {
        months: months.map(month => ({
          month: month.month,
          note: month.note,
          income: month.income,
          income_formatted: formatCurrency(month.income),
          budgeted: month.budgeted,
          budgeted_formatted: formatCurrency(month.budgeted),
          activity: month.activity,
          activity_formatted: formatCurrency(month.activity),
          to_be_budgeted: month.to_be_budgeted,
          to_be_budgeted_formatted: formatCurrency(month.to_be_budgeted),
          age_of_money: month.age_of_money
        })),
        server_knowledge: response.data.server_knowledge
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
 * Get details of a specific budget month
 * @param {object} params - Parameters with email, budgetId, and month
 * @returns {Promise<object>} Month details with category groups
 */
async function getMonth(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.month) {
    throw new ValidationError('Month parameter is required (format: YYYY-MM)');
  }
  
  // Validate month format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(params.month)) {
    throw new ValidationError('Month must be in format YYYY-MM (e.g., 2025-04)');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting month ${params.month} for budget ${params.budgetId}`);
    
    try {
      // Format month for YNAB API: YYYY-MM becomes YYYY-MM-01
      const monthFormatted = `${params.month}-01`;
      
      const response = await ynabAPI.months.getBudgetMonth(
        params.budgetId,
        monthFormatted
      );
      
      const month = response.data.month;
      
      // Format the month data
      return {
        month: month.month,
        note: month.note,
        income: month.income,
        income_formatted: formatCurrency(month.income),
        budgeted: month.budgeted,
        budgeted_formatted: formatCurrency(month.budgeted),
        activity: month.activity,
        activity_formatted: formatCurrency(month.activity),
        to_be_budgeted: month.to_be_budgeted,
        to_be_budgeted_formatted: formatCurrency(month.to_be_budgeted),
        age_of_money: month.age_of_money,
        categories: month.categories 
          ? month.categories.map(category => ({
              id: category.id,
              name: category.name,
              hidden: category.hidden,
              category_group_id: category.category_group_id,
              budgeted: category.budgeted,
              budgeted_formatted: formatCurrency(category.budgeted),
              activity: category.activity,
              activity_formatted: formatCurrency(category.activity),
              balance: category.balance,
              balance_formatted: formatCurrency(category.balance),
              goal_type: category.goal_type,
              goal_target: category.goal_target,
              goal_target_month: category.goal_target_month,
              goal_percentage_complete: category.goal_percentage_complete
            }))
          : []
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Month ${params.month} not found in budget ${params.budgetId}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Format currency amount (in milliunits) to a readable string
 * @param {number} amountInMilliunits - Amount in milliunits
 * @returns {string} Formatted currency string
 */
function formatCurrency(amountInMilliunits) {
  const amount = amountInMilliunits / 1000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

module.exports = {
  listMonths,
  getMonth
};