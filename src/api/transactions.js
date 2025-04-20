/**
 * YNAB Transactions API operations
 * Handles transaction listing, creation, and updates
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List transactions with optional filtering
 * @param {object} params - Parameters with email, budgetId, and optional filters
 * @returns {Promise<object>} List of transactions
 */
async function listTransactions(params) {
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
    logger.info(`Listing transactions for budget ${params.budgetId} for ${params.email}`);
    
    try {
      // Set up filter options
      const options = {};
      
      // Add since_date filter if provided
      if (params.since_date) {
        options.since_date = params.since_date;
      }
      
      // Add type filter if provided
      if (params.type) {
        options.type = params.type;
      }
      
      // Filter by account if provided
      if (params.accountId) {
        // If account ID is provided, use getTransactionsByAccount
        const response = await ynabAPI.transactions.getTransactionsByAccount(
          params.budgetId,
          params.accountId,
          options
        );
        
        return formatTransactionsResponse(response.data);
      } 
      
      // Filter by category if provided
      else if (params.categoryId) {
        // If category ID is provided, use getTransactionsByCategory
        const response = await ynabAPI.transactions.getTransactionsByCategory(
          params.budgetId,
          params.categoryId,
          options
        );
        
        return formatTransactionsResponse(response.data);
      }
      
      // Filter by payee if provided
      else if (params.payeeId) {
        // If payee ID is provided, use getTransactionsByPayee
        const response = await ynabAPI.transactions.getTransactionsByPayee(
          params.budgetId,
          params.payeeId,
          options
        );
        
        return formatTransactionsResponse(response.data);
      }
      
      // No specific filter provided, get all transactions
      else {
        const response = await ynabAPI.transactions.getTransactions(
          params.budgetId, 
          options
        );
        
        return formatTransactionsResponse(response.data);
      }
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(`Resource not found for the specified filter`);
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Get details of a specific transaction
 * @param {object} params - Parameters with email, budgetId, and transactionId
 * @returns {Promise<object>} Transaction details
 */
async function getTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.transactionId) {
    throw new ValidationError('Transaction ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting transaction ${params.transactionId} for budget ${params.budgetId}`);
    
    try {
      const response = await ynabAPI.transactions.getTransactionById(
        params.budgetId,
        params.transactionId
      );
      
      const transaction = response.data.transaction;
      
      // Format the transaction for display
      return formatTransaction(transaction);
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Transaction with ID ${params.transactionId} not found in budget ${params.budgetId}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Create a new transaction
 * @param {object} params - Parameters with email, budgetId, and transaction data
 * @returns {Promise<object>} Created transaction
 */
async function createTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.transaction) {
    throw new ValidationError('Transaction data is required');
  }
  
  // Validate required transaction fields
  const txn = params.transaction;
  if (!txn.account_id) {
    throw new ValidationError('Transaction must include account_id');
  }
  
  if (!txn.date) {
    throw new ValidationError('Transaction must include date (format: YYYY-MM-DD)');
  }
  
  if (txn.amount === undefined) {
    throw new ValidationError('Transaction must include amount');
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
    logger.info(`Creating transaction for budget ${params.budgetId}`);
    
    try {
      // Create transaction request
      const request = { transaction: transactionData };
      
      const response = await ynabAPI.transactions.createTransaction(
        params.budgetId,
        request
      );
      
      // Get the created transaction
      const transaction = response.data.transaction;
      
      // Format the transaction for display
      return formatTransaction(transaction);
    } catch (error) {
      logger.error(`Error creating transaction: ${error.message}`, error);
      
      // Check for 400 error with specific details
      if (error.error && error.error.id === '400') {
        throw new ValidationError(
          `Invalid transaction data: ${error.error.detail || error.message}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Update an existing transaction
 * @param {object} params - Parameters with email, budgetId, transactionId, and transaction data
 * @returns {Promise<object>} Updated transaction
 */
async function updateTransaction(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.transactionId) {
    throw new ValidationError('Transaction ID parameter is required');
  }
  
  if (!params.transaction) {
    throw new ValidationError('Transaction data is required');
  }
  
  // Prepare transaction for API
  const transactionData = {
    id: params.transactionId,
    ...params.transaction
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
    logger.info(`Updating transaction ${params.transactionId} for budget ${params.budgetId}`);
    
    try {
      // Update transaction request
      const request = { transaction: transactionData };
      
      const response = await ynabAPI.transactions.updateTransaction(
        params.budgetId,
        params.transactionId,
        request
      );
      
      // Get the updated transaction
      const transaction = response.data.transaction;
      
      // Format the transaction for display
      return formatTransaction(transaction);
    } catch (error) {
      logger.error(`Error updating transaction: ${error.message}`, error);
      
      // Check for specific errors
      if (error.error) {
        if (error.error.id === '404') {
          throw new NotFoundError(
            `Transaction with ID ${params.transactionId} not found in budget ${params.budgetId}`
          );
        }
        
        if (error.error.id === '400') {
          throw new ValidationError(
            `Invalid transaction data: ${error.error.detail || error.message}`
          );
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Create multiple transactions at once
 * @param {object} params - Parameters with email, budgetId, and array of transactions
 * @returns {Promise<object>} Bulk transaction creation result
 */
async function bulkCreateTransactions(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.transactions || !Array.isArray(params.transactions)) {
    throw new ValidationError('Transactions array is required');
  }
  
  if (params.transactions.length === 0) {
    throw new ValidationError('Transactions array cannot be empty');
  }
  
  // Prepare transactions for API
  const transactions = params.transactions.map(txn => {
    // Validate required fields
    if (!txn.account_id) {
      throw new ValidationError('Each transaction must include account_id');
    }
    
    if (!txn.date) {
      throw new ValidationError('Each transaction must include date (format: YYYY-MM-DD)');
    }
    
    if (txn.amount === undefined) {
      throw new ValidationError('Each transaction must include amount');
    }
    
    // Convert amount to milliunits if needed
    return {
      ...txn,
      amount: typeof txn.amount === 'number' && Math.abs(txn.amount) >= 1000
        ? txn.amount  // Assume it's already in milliunits if >= 1000
        : Math.round(txn.amount * 1000)  // Convert to milliunits
    };
  });
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Bulk creating ${transactions.length} transactions for budget ${params.budgetId}`);
    
    try {
      // Create bulk transaction request
      const request = { transactions };
      
      const response = await ynabAPI.transactions.createTransactions(
        params.budgetId,
        request
      );
      
      // Get the transaction ids and duplicates
      const result = response.data;
      
      return {
        transaction_ids: result.transaction_ids,
        duplicate_import_ids: result.duplicate_import_ids,
        transactions: result.transactions ? result.transactions.map(formatTransaction) : []
      };
    } catch (error) {
      logger.error(`Error creating bulk transactions: ${error.message}`, error);
      
      // Check for 400 error with specific details
      if (error.error && error.error.id === '400') {
        throw new ValidationError(
          `Invalid transaction data: ${error.error.detail || error.message}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Format a single transaction for display
 * @param {object} transaction - Transaction object from YNAB API
 * @returns {object} Formatted transaction
 */
function formatTransaction(transaction) {
  // Format currency values
  const amountFormatted = formatCurrency(transaction.amount);
  
  return {
    id: transaction.id,
    date: transaction.date,
    amount: transaction.amount,
    amount_formatted: amountFormatted,
    memo: transaction.memo,
    cleared: transaction.cleared,
    approved: transaction.approved,
    flag_color: transaction.flag_color,
    account_id: transaction.account_id,
    account_name: transaction.account_name,
    payee_id: transaction.payee_id,
    payee_name: transaction.payee_name,
    category_id: transaction.category_id,
    category_name: transaction.category_name,
    transfer_account_id: transaction.transfer_account_id,
    transfer_transaction_id: transaction.transfer_transaction_id,
    matched_transaction_id: transaction.matched_transaction_id,
    import_id: transaction.import_id,
    deleted: transaction.deleted,
    subtransactions: transaction.subtransactions
      ? transaction.subtransactions.map(sub => ({
          id: sub.id,
          amount: sub.amount,
          amount_formatted: formatCurrency(sub.amount),
          memo: sub.memo,
          payee_id: sub.payee_id,
          payee_name: sub.payee_name,
          category_id: sub.category_id,
          category_name: sub.category_name,
          transfer_account_id: sub.transfer_account_id,
          transfer_transaction_id: sub.transfer_transaction_id,
          deleted: sub.deleted
        }))
      : []
  };
}

/**
 * Format transactions response data
 * @param {object} data - Response data from YNAB API
 * @returns {object} Formatted response with transactions
 */
function formatTransactionsResponse(data) {
  return {
    transactions: data.transactions.map(formatTransaction),
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
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  bulkCreateTransactions
};