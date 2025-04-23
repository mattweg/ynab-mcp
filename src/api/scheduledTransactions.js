/**
 * YNAB Scheduled Transactions API operations
 * Handles scheduled transaction listing, creation, updates, and deletion
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List scheduled transactions with optional filtering
 * @param {object} params - Parameters with email, budgetId
 * @returns {Promise<object>} List of scheduled transactions
 */
async function listScheduledTransactions(params) {
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
    logger.info(`Listing scheduled transactions for budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.scheduled_transactions.getScheduledTransactions(
        params.budgetId
      );
      
      return formatScheduledTransactionsResponse(response.data);
    } catch (error) {
      logger.error(`Error listing scheduled transactions: ${error.message}`, error);
      
      // Check for specific error types
      if (error.error) {
        if (error.error.id === '404') {
          throw new NotFoundError(`Budget not found with ID ${params.budgetId}`);
        }
        
        if (error.error.id === '400') {
          // Detailed information for bad request errors
          const detailMessage = error.error.detail || error.message;
          throw new ValidationError(`Invalid request: ${detailMessage}`);
        }
      }
      
      // If this is already one of our custom errors, re-throw it
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      // Otherwise, wrap in a more informative error message
      throw new Error(`Failed to retrieve scheduled transactions: ${error.message}`);
    }
  });
}

/**
 * Get details of a specific scheduled transaction
 * @param {object} params - Parameters with email, budgetId, and scheduledTransactionId
 * @returns {Promise<object>} Scheduled transaction details
 */
async function getScheduledTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.scheduledTransactionId) {
    throw new ValidationError('Scheduled Transaction ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting scheduled transaction ${params.scheduledTransactionId} for budget ${params.budgetId}`);
    
    try {
      const response = await ynabAPI.scheduled_transactions.getScheduledTransactionById(
        params.budgetId,
        params.scheduledTransactionId
      );
      
      const scheduledTransaction = response.data.scheduled_transaction;
      
      // Format the scheduled transaction for display
      return formatScheduledTransaction(scheduledTransaction);
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Scheduled transaction with ID ${params.scheduledTransactionId} not found in budget ${params.budgetId}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Create a new scheduled transaction
 * @param {object} params - Parameters with email, budgetId, and scheduledTransaction data
 * @returns {Promise<object>} Created scheduled transaction
 */
async function createScheduledTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.scheduledTransaction) {
    throw new ValidationError('Scheduled transaction data is required');
  }
  
  // Validate required transaction fields
  const txn = params.scheduledTransaction;
  if (!txn.account_id) {
    throw new ValidationError('Scheduled transaction must include account_id');
  }
  
  if (!txn.date_first) {
    throw new ValidationError('Scheduled transaction must include date_first (format: YYYY-MM-DD)');
  }
  
  if (txn.amount === undefined) {
    throw new ValidationError('Scheduled transaction must include amount');
  }
  
  if (!txn.frequency) {
    throw new ValidationError('Scheduled transaction must include frequency');
  }
  
  // Prepare transaction for API - convert amount to milliunits if needed
  const transactionData = {
    ...txn,
    amount: typeof txn.amount === 'number' && Math.abs(txn.amount) >= 1000 
      ? txn.amount  // Assume it's already in milliunits if >= 1000
      : Math.round(txn.amount * 1000)  // Convert to milliunits
  };
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Creating scheduled transaction for budget ${params.budgetId}`);
    
    try {
      // Create transaction request
      const request = { scheduled_transaction: transactionData };
      
      const response = await ynabAPI.scheduled_transactions.createScheduledTransaction(
        params.budgetId,
        request
      );
      
      // Get the created scheduled transaction
      const scheduledTransaction = response.data.scheduled_transaction;
      
      // Format the scheduled transaction for display
      return formatScheduledTransaction(scheduledTransaction);
    } catch (error) {
      logger.error(`Error creating scheduled transaction: ${error.message}`, error);
      
      // Check for 400 error with specific details
      if (error.error && error.error.id === '400') {
        throw new ValidationError(
          `Invalid scheduled transaction data: ${error.error.detail || error.message}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Update an existing scheduled transaction
 * @param {object} params - Parameters with email, budgetId, scheduledTransactionId, and scheduledTransaction data
 * @returns {Promise<object>} Updated scheduled transaction
 */
async function updateScheduledTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.scheduledTransactionId) {
    throw new ValidationError('Scheduled Transaction ID parameter is required');
  }
  
  if (!params.scheduledTransaction) {
    throw new ValidationError('Scheduled transaction data is required');
  }
  
  // Prepare transaction for API
  const transactionData = {
    id: params.scheduledTransactionId,
    ...params.scheduledTransaction
  };
  
  // Convert amount to milliunits if provided and needed
  if (transactionData.amount !== undefined) {
    transactionData.amount = typeof transactionData.amount === 'number' && Math.abs(transactionData.amount) >= 1000
      ? transactionData.amount  // Assume it's already in milliunits if >= 1000
      : Math.round(transactionData.amount * 1000);  // Convert to milliunits
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Updating scheduled transaction ${params.scheduledTransactionId} for budget ${params.budgetId}`);
    
    try {
      // Update transaction request
      const request = { scheduled_transaction: transactionData };
      
      const response = await ynabAPI.scheduled_transactions.updateScheduledTransaction(
        params.budgetId,
        params.scheduledTransactionId,
        request
      );
      
      // Get the updated scheduled transaction
      const scheduledTransaction = response.data.scheduled_transaction;
      
      // Format the scheduled transaction for display
      return formatScheduledTransaction(scheduledTransaction);
    } catch (error) {
      logger.error(`Error updating scheduled transaction: ${error.message}`, error);
      
      // Check for specific errors
      if (error.error) {
        if (error.error.id === '404') {
          throw new NotFoundError(
            `Scheduled transaction with ID ${params.scheduledTransactionId} not found in budget ${params.budgetId}`
          );
        }
        
        if (error.error.id === '400') {
          throw new ValidationError(
            `Invalid scheduled transaction data: ${error.error.detail || error.message}`
          );
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Delete a scheduled transaction
 * @param {object} params - Parameters with email, budgetId, and scheduledTransactionId
 * @returns {Promise<object>} Deletion result
 */
async function deleteScheduledTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.scheduledTransactionId) {
    throw new ValidationError('Scheduled Transaction ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Deleting scheduled transaction ${params.scheduledTransactionId} for budget ${params.budgetId}`);
    
    try {
      const response = await ynabAPI.scheduled_transactions.deleteScheduledTransaction(
        params.budgetId,
        params.scheduledTransactionId
      );
      
      return {
        success: true,
        message: `Scheduled transaction ${params.scheduledTransactionId} deleted successfully`
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Scheduled transaction with ID ${params.scheduledTransactionId} not found in budget ${params.budgetId}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Format a single scheduled transaction for display
 * @param {object} transaction - Scheduled transaction object from YNAB API
 * @returns {object} Formatted scheduled transaction
 */
function formatScheduledTransaction(transaction) {
  // Format currency values
  const amountFormatted = formatCurrency(transaction.amount);
  
  return {
    id: transaction.id,
    date_first: transaction.date_first,
    date_next: transaction.date_next,
    frequency: transaction.frequency,
    amount: transaction.amount,
    amount_formatted: amountFormatted,
    memo: transaction.memo,
    flag_color: transaction.flag_color,
    account_id: transaction.account_id,
    account_name: transaction.account_name,
    payee_id: transaction.payee_id,
    payee_name: transaction.payee_name,
    category_id: transaction.category_id,
    category_name: transaction.category_name,
    transfer_account_id: transaction.transfer_account_id,
    deleted: transaction.deleted
  };
}

/**
 * Format scheduled transactions response data
 * @param {object} data - Response data from YNAB API
 * @returns {object} Formatted response with scheduled transactions
 */
function formatScheduledTransactionsResponse(data) {
  return {
    scheduled_transactions: data.scheduled_transactions.map(formatScheduledTransaction),
    server_knowledge: data.server_knowledge
  };
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
  listScheduledTransactions,
  getScheduledTransaction,
  createScheduledTransaction,
  updateScheduledTransaction,
  deleteScheduledTransaction
};