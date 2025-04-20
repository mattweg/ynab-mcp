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
      const response = await ynabAPI.categories.getCategories(params.budgetId);
      const categoryGroups = response.data.category_groups;
      
      // Format the response for easier consumption
      const formattedGroups = categoryGroups
        .filter(group => !group.deleted && group.name !== 'Internal Master Category')
        .map(group => ({
          id: group.id,
          name: group.name,
          hidden: group.hidden,
          categories: group.categories
            .filter(category => !category.deleted)
            .map(category => ({
              id: category.id,
              name: category.name,
              hidden: category.hidden,
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
        }));
      
      return {
        category_groups: formattedGroups,
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
      const response = await ynabAPI.categories.getCategoryById(
        params.budgetId,
        params.categoryId
      );
      
      const category = response.data.category;
      
      // Format currency values for display
      const budgetedFormatted = formatCurrency(category.budgeted);
      const activityFormatted = formatCurrency(category.activity);
      const balanceFormatted = formatCurrency(category.balance);
      
      // Return formatted category details with goal information
      return {
        id: category.id,
        category_group_id: category.category_group_id,
        name: category.name,
        hidden: category.hidden,
        note: category.note,
        budgeted: category.budgeted,
        budgeted_formatted: budgetedFormatted,
        activity: category.activity,
        activity_formatted: activityFormatted,
        balance: category.balance,
        balance_formatted: balanceFormatted,
        goal_type: category.goal_type,
        goal_target: category.goal_target,
        goal_target_month: category.goal_target_month,
        goal_percentage_complete: category.goal_percentage_complete,
        goal_months_to_budget: category.goal_months_to_budget,
        deleted: category.deleted
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Category with ID ${params.categoryId} not found in budget ${params.budgetId}`
        );
      }
      
      // Re-throw other errors
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
  
  // Validate month format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(params.month)) {
    throw new ValidationError('Month must be in format YYYY-MM (e.g., 2025-04)');
  }
  
  // Convert budgeted amount to milliunits if it's not already
  // YNAB API expects amounts in milliunits (e.g., $1.00 = 1000)
  const budgetedMilliunits = typeof params.budgeted === 'number' && params.budgeted >= 1000 
    ? params.budgeted  // Assume it's already in milliunits if >= 1000
    : Math.round(params.budgeted * 1000);  // Convert to milliunits
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Updating category ${params.categoryId} budget for ${params.month} to ${budgetedMilliunits} milliunits`);
    
    try {
      // Format month for YNAB API: YYYY-MM becomes YYYY-MM-01
      const monthFormatted = `${params.month}-01`;
      
      // Update the month category
      const response = await ynabAPI.categories.updateMonthCategory(
        params.budgetId,
        monthFormatted,
        params.categoryId,
        { category: { budgeted: budgetedMilliunits } }
      );
      
      const category = response.data.category;
      
      // Format currency values for display
      return {
        id: category.id,
        name: category.name,
        month: params.month,
        budgeted: category.budgeted,
        budgeted_formatted: formatCurrency(category.budgeted),
        activity: category.activity,
        activity_formatted: formatCurrency(category.activity),
        balance: category.balance,
        balance_formatted: formatCurrency(category.balance),
        goal_target: category.goal_target,
        goal_percentage_complete: category.goal_percentage_complete
      };
    } catch (error) {
      logger.error(`Error updating category: ${error.message}`, error);
      
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Category or month not found: ${params.categoryId} for ${params.month}`
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
  listCategories,
  getCategory,
  updateCategory
};