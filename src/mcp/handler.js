/**
 * MCP Protocol Handler for YNAB integration
 * Processes incoming MCP requests and routes to the appropriate functions
 */

const { logger } = require('../utils/logger');
const { ValidationError, formatMcpError } = require('../utils/errorHandler');
const { startAuthentication, completeAuthentication, removeAuthentication, listAuthenticatedAccounts } = require('../auth/oauth');
const budgetsApi = require('../api/budgets');
const accountsApi = require('../api/accounts');
const categoriesApi = require('../api/categories');
const transactionsApi = require('../api/transactions');
const payeesApi = require('../api/payees');
const monthsApi = require('../api/months');

// Map of supported MCP functions to their implementations
const functionMap = {
  // Authentication functions
  list_ynab_accounts: listAuthenticatedAccounts,
  authenticate_ynab_account: handleAuthentication,
  remove_ynab_account: removeAuthentication,
  
  // Budget operations
  list_budgets: budgetsApi.listBudgets,
  get_budget: budgetsApi.getBudget,
  get_budget_settings: budgetsApi.getBudgetSettings,
  
  // Account operations
  list_accounts: accountsApi.listAccounts,
  get_account: accountsApi.getAccount,
  
  // Category operations
  list_categories: categoriesApi.listCategories,
  get_category: categoriesApi.getCategory,
  update_category: categoriesApi.updateCategory,
  
  // Transaction operations
  list_transactions: transactionsApi.listTransactions,
  get_transaction: transactionsApi.getTransaction,
  create_transaction: transactionsApi.createTransaction,
  update_transaction: transactionsApi.updateTransaction,
  bulk_create_transactions: transactionsApi.bulkCreateTransactions,
  
  // Payee operations
  list_payees: payeesApi.listPayees,
  get_payee: payeesApi.getPayee,
  get_payee_transactions: payeesApi.getPayeeTransactions,
  
  // Month operations
  list_months: monthsApi.listMonths,
  get_month: monthsApi.getMonth,
};

/**
 * Handle authentication requests, either starting or completing authentication
 * @param {object} params - Authentication parameters
 * @returns {Promise<object>} Authentication result
 */
async function handleAuthentication(params) {
  if (!params.email) {
    throw new ValidationError('Email parameter is required');
  }
  
  // If auth_code is provided, complete authentication
  if (params.auth_code) {
    return await completeAuthentication(params.email, params.auth_code);
  }
  
  // Otherwise, start a new authentication flow
  return await startAuthentication(params.email);
}

/**
 * Process an MCP request and return the result
 * @param {object} request - MCP request object
 * @returns {Promise<object>} MCP response
 */
async function handleRequest(request) {
  try {
    logger.info(`Processing MCP request: ${request.function || 'unknown'}`);
    
    // Validate function name
    const functionName = request.function;
    if (!functionName) {
      throw new ValidationError('Function name is required');
    }
    
    // Check if function is supported
    if (!functionMap[functionName]) {
      throw new ValidationError(`Unsupported function: ${functionName}`);
    }
    
    // Call the function with parameters
    const result = await functionMap[functionName](request.parameters || {});
    
    return {
      result,
      status: 'success'
    };
  } catch (error) {
    logger.error(`Error processing MCP request: ${error.message}`, error);
    
    // Format error for MCP response
    return formatMcpError(error);
  }
}

module.exports = {
  handleRequest
};