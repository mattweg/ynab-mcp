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
 * Assign budget from Ready to Assign to specific categories
 * @param {object} params - Parameters with email, budgetId, month, and categoryAllocations
 * @returns {Promise<object>} Results of the budget assignment operation
 */
async function assignToCategories(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.month) {
    throw new ValidationError('Month parameter is required (format: YYYY-MM)');
  }
  
  if (!params.categoryAllocations || !Array.isArray(params.categoryAllocations) || params.categoryAllocations.length === 0) {
    throw new ValidationError('Category allocations array is required and must not be empty');
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
    logger.info(`Assigning budget for ${params.month} in budget ${params.budgetId}`);
    
    try {
      // Format month for YNAB API: YYYY-MM becomes YYYY-MM-01
      const monthFormatted = `${params.month}-01`;
      
      // First, get the current month data to check available amount
      const monthResponse = await ynabAPI.months.getBudgetMonth(
        params.budgetId,
        monthFormatted
      );
      
      const month = monthResponse.data.month;
      const availableToAssign = month.to_be_budgeted;
      
      if (availableToAssign <= 0) {
        return {
          success: false,
          message: 'No funds available to assign',
          available_to_assign: availableToAssign,
          available_to_assign_formatted: formatCurrency(availableToAssign)
        };
      }
      
      // Calculate total allocation requested
      let totalRequestedAllocation = 0;
      for (const allocation of params.categoryAllocations) {
        // Convert amount to milliunits if needed
        const amountInMilliunits = typeof allocation.amount === 'number' && allocation.amount >= 1000
          ? allocation.amount
          : Math.round(allocation.amount * 1000);
        
        totalRequestedAllocation += amountInMilliunits;
      }
      
      // Check if requested allocation exceeds available funds
      if (totalRequestedAllocation > availableToAssign) {
        return {
          success: false,
          message: 'Requested allocation exceeds available funds',
          available_to_assign: availableToAssign,
          available_to_assign_formatted: formatCurrency(availableToAssign),
          requested_allocation: totalRequestedAllocation,
          requested_allocation_formatted: formatCurrency(totalRequestedAllocation)
        };
      }
      
      // Perform the allocations
      const results = [];
      for (const allocation of params.categoryAllocations) {
        // Get current category data
        const categoryResponse = await ynabAPI.categories.getCategoryById(
          params.budgetId,
          allocation.categoryId
        );
        
        const category = categoryResponse.data.category;
        const currentBudgeted = category.budgeted;
        
        // Convert amount to milliunits if needed
        const allocationAmount = typeof allocation.amount === 'number' && allocation.amount >= 1000
          ? allocation.amount
          : Math.round(allocation.amount * 1000);
        
        // Calculate new budgeted amount
        const newBudgeted = currentBudgeted + allocationAmount;
        
        // Update the category
        const updateResponse = await ynabAPI.categories.updateMonthCategory(
          params.budgetId,
          monthFormatted,
          allocation.categoryId,
          { category: { budgeted: newBudgeted } }
        );
        
        const updatedCategory = updateResponse.data.category;
        
        results.push({
          category_id: updatedCategory.id,
          category_name: updatedCategory.name,
          previous_budgeted: currentBudgeted,
          previous_budgeted_formatted: formatCurrency(currentBudgeted),
          allocated_amount: allocationAmount,
          allocated_amount_formatted: formatCurrency(allocationAmount),
          new_budgeted: updatedCategory.budgeted,
          new_budgeted_formatted: formatCurrency(updatedCategory.budgeted),
          balance: updatedCategory.balance,
          balance_formatted: formatCurrency(updatedCategory.balance)
        });
      }
      
      // Get updated month data
      const updatedMonthResponse = await ynabAPI.months.getBudgetMonth(
        params.budgetId,
        monthFormatted
      );
      
      const updatedMonth = updatedMonthResponse.data.month;
      
      return {
        success: true,
        message: 'Successfully assigned funds to categories',
        month: params.month,
        previous_available_to_assign: availableToAssign,
        previous_available_to_assign_formatted: formatCurrency(availableToAssign),
        total_assigned: totalRequestedAllocation,
        total_assigned_formatted: formatCurrency(totalRequestedAllocation),
        remaining_to_assign: updatedMonth.to_be_budgeted,
        remaining_to_assign_formatted: formatCurrency(updatedMonth.to_be_budgeted),
        category_results: results
      };
    } catch (error) {
      logger.error(`Error assigning to categories: ${error.message}`, error);
      
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Budget or month not found: ${params.budgetId} for ${params.month}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Get recommended category allocations based on spending patterns
 * @param {object} params - Parameters with email, budgetId, month, and optionally availableAmount
 * @returns {Promise<object>} Recommended category allocations
 */
async function getRecommendedAllocations(params) {
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
    logger.info(`Generating recommended allocations for ${params.month} in budget ${params.budgetId}`);
    
    try {
      // Format month for YNAB API: YYYY-MM becomes YYYY-MM-01
      const monthFormatted = `${params.month}-01`;
      
      // Get the current month data to check available amount
      const monthResponse = await ynabAPI.months.getBudgetMonth(
        params.budgetId,
        monthFormatted
      );
      
      const month = monthResponse.data.month;
      const availableToAssign = params.availableAmount || month.to_be_budgeted;
      
      if (availableToAssign <= 0) {
        return {
          success: false,
          message: 'No funds available to assign',
          available_to_assign: availableToAssign,
          available_to_assign_formatted: formatCurrency(availableToAssign)
        };
      }
      
      // Get all categories
      const categoriesResponse = await ynabAPI.categories.getCategories(params.budgetId);
      const categoryGroups = categoriesResponse.data.category_groups;
      
      // Get previous months for spending analysis
      // Extract month and year for analysis
      const [yearStr, monthStr] = params.month.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      
      // Create date for previous month
      const prevMonthDate = new Date(year, month - 2, 1); // -2 because months are 0-indexed
      const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
      const prevMonthFormatted = `${prevMonth}-01`;
      
      // Get previous month's budget data
      let prevMonthData;
      try {
        const prevMonthResponse = await ynabAPI.months.getBudgetMonth(
          params.budgetId,
          prevMonthFormatted
        );
        prevMonthData = prevMonthResponse.data.month;
      } catch (error) {
        // If previous month not available, continue without it
        logger.warn(`Previous month ${prevMonth} not available for analysis`);
        prevMonthData = null;
      }
      
      // Get goals and underfunded categories
      const recommendations = [];
      let remainingToAssign = availableToAssign;
      
      // Collect all non-hidden, non-deleted categories with their current state
      const allCategories = [];
      
      categoryGroups
        .filter(group => !group.deleted && group.name !== 'Internal Master Category')
        .forEach(group => {
          group.categories
            .filter(category => !category.deleted && !category.hidden)
            .forEach(category => {
              const monthCategory = month.categories.find(c => c.id === category.id);
              
              if (monthCategory) {
                const prevMonthCategory = prevMonthData 
                  ? prevMonthData.categories.find(c => c.id === category.id) 
                  : null;
                
                allCategories.push({
                  id: category.id,
                  name: category.name,
                  group_id: group.id,
                  group_name: group.name,
                  budgeted: monthCategory.budgeted,
                  balance: monthCategory.balance,
                  activity: monthCategory.activity,
                  goal_type: category.goal_type,
                  goal_target: category.goal_target,
                  goal_percentage_complete: monthCategory.goal_percentage_complete || 0,
                  previous_month_budgeted: prevMonthCategory ? prevMonthCategory.budgeted : 0,
                  previous_month_activity: prevMonthCategory ? prevMonthCategory.activity : 0
                });
              }
            });
        });
      
      // Prioritize underfunded categories with goals
      const categoriesWithGoals = allCategories.filter(cat => cat.goal_type && cat.goal_percentage_complete < 100);
      
      categoriesWithGoals.forEach(category => {
        if (remainingToAssign <= 0) return;
        
        // Calculate underfunded amount for goal
        const underfundedAmount = category.goal_type 
          ? Math.max(0, category.goal_target - category.budgeted)
          : 0;
          
        if (underfundedAmount > 0) {
          const allocationAmount = Math.min(underfundedAmount, remainingToAssign);
          
          if (allocationAmount > 0) {
            recommendations.push({
              category_id: category.id,
              category_name: category.name,
              group_name: category.group_name,
              recommended_amount: allocationAmount,
              recommended_amount_formatted: formatCurrency(allocationAmount),
              reason: `Underfunded goal (${category.goal_percentage_complete}% funded)`,
              priority: 'high'
            });
            
            remainingToAssign -= allocationAmount;
          }
        }
      });
      
      // For essential spending categories with negative balance
      const essentialCategories = allCategories.filter(cat => 
        // Define essential category groups here
        ['Immediate Obligations', 'Monthly Bills', 'Everyday Expenses'].includes(cat.group_name) && 
        cat.balance < 0
      );
      
      essentialCategories.forEach(category => {
        if (remainingToAssign <= 0) return;
        
        // Allocate to cover negative balance
        const allocationAmount = Math.min(Math.abs(category.balance), remainingToAssign);
        
        if (allocationAmount > 0) {
          recommendations.push({
            category_id: category.id,
            category_name: category.name,
            group_name: category.group_name,
            recommended_amount: allocationAmount,
            recommended_amount_formatted: formatCurrency(allocationAmount),
            reason: 'Negative balance in essential category',
            priority: 'high'
          });
          
          remainingToAssign -= allocationAmount;
        }
      });
      
      // For categories that consistently have spending
      const regularSpendingCategories = allCategories.filter(cat => 
        cat.previous_month_activity < 0 && // Has spending (negative activity)
        !recommendations.some(rec => rec.category_id === cat.id) && // Not already in recommendations
        cat.balance < Math.abs(cat.previous_month_activity * 0.5) // Balance is less than half of typical spending
      );
      
      regularSpendingCategories.forEach(category => {
        if (remainingToAssign <= 0) return;
        
        // Allocate based on previous month's spending
        const recommendedAmount = Math.min(
          Math.abs(category.previous_month_activity) - category.balance, 
          remainingToAssign
        );
        
        if (recommendedAmount > 0) {
          recommendations.push({
            category_id: category.id,
            category_name: category.name,
            group_name: category.group_name,
            recommended_amount: recommendedAmount,
            recommended_amount_formatted: formatCurrency(recommendedAmount),
            reason: 'Regular spending category with insufficient funds',
            priority: 'medium'
          });
          
          remainingToAssign -= recommendedAmount;
        }
      });
      
      // For saving categories and other priorities
      if (remainingToAssign > 0) {
        const savingsCategories = allCategories.filter(cat => 
          ['Savings Goals', 'Quality of Life Goals', 'Long Term'].includes(cat.group_name) &&
          !recommendations.some(rec => rec.category_id === cat.id)
        );
        
        // Distribute remaining funds proportionally to savings categories
        if (savingsCategories.length > 0) {
          const allocPerCategory = Math.floor(remainingToAssign / savingsCategories.length);
          
          savingsCategories.forEach(category => {
            if (remainingToAssign <= 0 || allocPerCategory <= 0) return;
            
            const allocationAmount = Math.min(allocPerCategory, remainingToAssign);
            
            recommendations.push({
              category_id: category.id,
              category_name: category.name,
              group_name: category.group_name,
              recommended_amount: allocationAmount,
              recommended_amount_formatted: formatCurrency(allocationAmount),
              reason: 'Savings/long-term goal',
              priority: 'low'
            });
            
            remainingToAssign -= allocationAmount;
          });
        }
      }
      
      // Sort recommendations by priority
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      
      return {
        success: true,
        month: params.month,
        available_to_assign: availableToAssign,
        available_to_assign_formatted: formatCurrency(availableToAssign),
        total_recommended: availableToAssign - remainingToAssign,
        total_recommended_formatted: formatCurrency(availableToAssign - remainingToAssign),
        remaining_unallocated: remainingToAssign,
        remaining_unallocated_formatted: formatCurrency(remainingToAssign),
        recommendations
      };
    } catch (error) {
      logger.error(`Error generating recommended allocations: ${error.message}`, error);
      
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Budget or month not found: ${params.budgetId} for ${params.month}`
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
  updateCategory,
  assignToCategories,         // New function for assigning funds to categories
  getRecommendedAllocations   // New function for generating recommended allocations
};