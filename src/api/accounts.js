/**
 * YNAB Accounts API operations
 * Handles account listing and retrieval
 */

const { API } = require('ynab');
const { logger } = require('../utils/logger');
const { tokenManager } = require('../auth/tokenManager');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');
const { rateLimiter } = require('../utils/rateLimit');

/**
 * List all accounts in a budget
 * @param {object} params - Parameters with email and budgetId
 * @returns {Promise<object>} List of accounts
 */
async function listAccounts(params) {
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
    logger.info(`Listing accounts for budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.accounts.getAccounts(params.budgetId);
      const accounts = response.data.accounts;
      
      // Format the response
      return {
        accounts: accounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          on_budget: account.on_budget,
          closed: account.closed,
          balance: account.balance,
          cleared_balance: account.cleared_balance,
          uncleared_balance: account.uncleared_balance,
          transfer_payee_id: account.transfer_payee_id,
          deleted: account.deleted
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
 * Get details of a specific account
 * @param {object} params - Parameters with email, budgetId, and accountId
 * @returns {Promise<object>} Account details
 */
async function getAccount(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  if (!params.budgetId) {
    throw new ValidationError('Budget ID parameter is required');
  }
  
  if (!params.accountId) {
    throw new ValidationError('Account ID parameter is required');
  }
  
  // Get fresh access token
  const accessToken = await tokenManager.getFreshAccessToken(params.email);
  
  // Create YNAB API instance
  const ynabAPI = new API(accessToken);
  
  // Use rate limiter to handle YNAB API limits
  return await rateLimiter.executeWithRateLimit(params.email, async () => {
    logger.info(`Getting account ${params.accountId} for budget ${params.budgetId} for ${params.email}`);
    
    try {
      const response = await ynabAPI.accounts.getAccountById(
        params.budgetId,
        params.accountId
      );
      
      const account = response.data.account;
      
      // Format currency values for display
      const balanceFormatted = formatCurrency(account.balance);
      const clearedBalanceFormatted = formatCurrency(account.cleared_balance);
      const unclearedBalanceFormatted = formatCurrency(account.uncleared_balance);
      
      // Return formatted account details
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        on_budget: account.on_budget,
        closed: account.closed,
        note: account.note,
        balance: account.balance,
        balance_formatted: balanceFormatted,
        cleared_balance: account.cleared_balance,
        cleared_balance_formatted: clearedBalanceFormatted,
        uncleared_balance: account.uncleared_balance,
        uncleared_balance_formatted: unclearedBalanceFormatted,
        transfer_payee_id: account.transfer_payee_id,
        deleted: account.deleted
      };
    } catch (error) {
      // Check for 404 error
      if (error.error && error.error.id === '404') {
        throw new NotFoundError(
          `Account with ID ${params.accountId} not found in budget ${params.budgetId}`
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
  listAccounts,
  getAccount
};