/**
 * YNAB Payees API operations
 * Handles payee listing and retrieval
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List all payees in a budget
 * @param {object} params - Parameters with email and budgetId
 * @returns {Promise<object>} List of payees
 */
async function listPayees(params) {
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
    logger.info(`Listing payees for budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.payees.getPayees(params.budgetId);
      const payees = response.data.payees;
      
      // Format the response
      return {
        payees: payees
          .filter(payee => !payee.deleted)
          .map(payee => ({
            id: payee.id,
            name: payee.name,
            transfer_account_id: payee.transfer_account_id,
            deleted: payee.deleted
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
 * Get details of a specific payee
 * @param {object} params - Parameters with email, budgetId, and payeeId
 * @returns {Promise<object>} Payee details
 */
async function getPayee(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.payeeId) {
    throw new ValidationError('Payee ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting payee ${params.payeeId} for budget ${params.budgetId}`);
    
    try {
      const response = await ynabAPI.payees.getPayeeById(
        params.budgetId,
        params.payeeId
      );
      
      const payee = response.data.payee;
      
      // Return payee details
      return {
        id: payee.id,
        name: payee.name,
        transfer_account_id: payee.transfer_account_id,
        deleted: payee.deleted
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Payee with ID ${params.payeeId} not found in budget ${params.budgetId}`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  });
}

/**
 * Get transactions for a specific payee
 * @param {object} params - Parameters with email, budgetId, and payeeId
 * @returns {Promise<object>} List of transactions for the payee
 */
async function getPayeeTransactions(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.payeeId) {
    throw new ValidationError('Payee ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting transactions for payee ${params.payeeId} in budget ${params.budgetId}`);
    
    try {
      // First, verify the payee exists
      const payeeResponse = await ynabAPI.payees.getPayeeById(
        params.budgetId,
        params.payeeId
      );
      
      const payee = payeeResponse.data.payee;
      
      // Then get transactions for this payee
      const transactionsResponse = await ynabAPI.transactions.getTransactionsByPayee(
        params.budgetId,
        params.payeeId
      );
      
      const transactions = transactionsResponse.data.transactions;
      
      // Format the transactions
      return {
        payee: {
          id: payee.id,
          name: payee.name,
          transfer_account_id: payee.transfer_account_id
        },
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          date: transaction.date,
          amount: transaction.amount,
          amount_formatted: formatCurrency(transaction.amount),
          memo: transaction.memo,
          cleared: transaction.cleared,
          approved: transaction.approved,
          account_id: transaction.account_id,
          account_name: transaction.account_name,
          category_id: transaction.category_id,
          category_name: transaction.category_name
        }))
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Payee with ID ${params.payeeId} not found in budget ${params.budgetId}`
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
  listPayees,
  getPayee,
  getPayeeTransactions
};