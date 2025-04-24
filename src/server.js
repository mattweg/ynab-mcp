/**
 * YNAB MCP Server
 * Main entry point for the YNAB Model Context Protocol server
 * Uses the official MCP SDK for communication with Claude
 */

// Import MCP SDK components
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} = require('@modelcontextprotocol/sdk/types.js');

// Import our modules
const { logger } = require('./utils/logger');
const { ValidationError } = require('./utils/errorHandler');
const { startAuthentication, completeAuthentication, removeAuthentication, listAuthenticatedAccounts } = require('./auth/oauth');
const budgetsApi = require('./api/budgets');
const accountsApi = require('./api/accounts');
const categoriesApi = require('./api/categories');
const transactionsApi = require('./api/transactions');
const payeesApi = require('./api/payees');
const monthsApi = require('./api/months');
const scheduledTransactionsApi = require('./api/scheduledTransactions');

// Import tools from toolDefinitions to ensure consistency
const { ynabTools } = require('./mcp/toolDefinitions');

// Handle authentication (both start and complete)
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

// Main server class
class YnabServer {
  constructor() {
    this.server = new Server(
      {
        name: "YNAB MCP Server",
        version: "0.1.0"
      },
      {
        capabilities: {
          tools: {
            list: true,
            call: true
          }
        }
      }
    );
    
    // Set up handlers
    this.setupHandlers();
    this.setupSignalHandlers();
  }
  
  /**
   * Set up signal handlers for graceful shutdown
   */
  setupSignalHandlers() {
    // Handle graceful shutdown on SIGINT (Ctrl+C) and SIGTERM (Docker stop)
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
    
    // Handle Docker-specific signals and Node.js IPC messages
    process.on('message', (msg) => {
      if (msg === 'shutdown') {
        this.shutdown();
      }
    });
    
    logger.info('Signal handlers registered for graceful shutdown');
  }

  /**
   * Gracefully shutdown the server
   */
  async shutdown() {
    logger.info('Received shutdown signal, closing YNAB MCP server...');
    
    try {
      // Add any cleanup code here if needed
      // For example, closing database connections, etc.
      
      // Give a short time for cleanup and logging to complete
      setTimeout(() => {
        logger.info('YNAB MCP server shutdown complete');
        process.exit(0); // Exit with success code so Docker will remove the container
      }, 500);
    } catch (error) {
      logger.error('Error during server shutdown:', error);
      process.exit(1); // Exit with error code
    }
  }
  
  setupHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Handling ListTools request');
      
      return {
        tools: ynabTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });
    
    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolName = request.params.name;
        const args = request.params.arguments || {};
        
        logger.info(`Handling CallTool request for tool: ${toolName}`);
        
        // Map tool name to handler function
        let result;
        switch (toolName) {
          case 'list_ynab_accounts':
            result = await listAuthenticatedAccounts();
            break;
          case 'authenticate_ynab_account':
            result = await handleAuthentication(args);
            break;
          case 'remove_ynab_account':
            result = await removeAuthentication(args.email);
            break;
            
          // Budget APIs
          case 'list_budgets':
            result = await budgetsApi.listBudgets(args);
            break;
          case 'get_budget':
            result = await budgetsApi.getBudget(args);
            break;
            
          // Account APIs
          case 'list_accounts':
            result = await accountsApi.listAccounts(args);
            break;
          case 'get_account':
            result = await accountsApi.getAccount(args);
            break;
            
          // Category APIs
          case 'list_categories':
            result = await categoriesApi.listCategories(args);
            break;
          case 'get_category':
            result = await categoriesApi.getCategory(args);
            break;
          case 'update_category':
            result = await categoriesApi.updateCategory(args);
            break;
          case 'assign_to_categories':
            result = await categoriesApi.assignToCategories(args);
            break;
          case 'get_recommended_allocations':
            result = await categoriesApi.getRecommendedAllocations(args);
            break;
            
          // Transaction APIs
          case 'list_transactions':
            result = await transactionsApi.listTransactions(args);
            break;
          case 'get_transaction':
            result = await transactionsApi.getTransaction(args);
            break;
          case 'create_transaction':
            result = await transactionsApi.createTransaction(args);
            break;
          case 'update_transaction':
            result = await transactionsApi.updateTransaction(args);
            break;
          case 'bulk_create_transactions':
            result = await transactionsApi.bulkCreateTransactions(args);
            break;
            
          // Scheduled Transaction APIs
          case 'list_scheduled_transactions':
            result = await scheduledTransactionsApi.listScheduledTransactions(args);
            break;
          case 'get_scheduled_transaction':
            result = await scheduledTransactionsApi.getScheduledTransaction(args);
            break;
          case 'create_scheduled_transaction':
            result = await scheduledTransactionsApi.createScheduledTransaction(args);
            break;
          case 'update_scheduled_transaction':
            result = await scheduledTransactionsApi.updateScheduledTransaction(args);
            break;
          case 'delete_scheduled_transaction':
            result = await scheduledTransactionsApi.deleteScheduledTransaction(args);
            break;
            
          // Payee APIs
          case 'list_payees':
            result = await payeesApi.listPayees(args);
            break;
          case 'get_payee':
            result = await payeesApi.getPayee(args);
            break;
          case 'get_payee_transactions':
            result = await payeesApi.getPayeeTransactions(args);
            break;
            
          // Month APIs
          case 'list_months':
            result = await monthsApi.listMonths(args);
            break;
          case 'get_month':
            result = await monthsApi.getMonth(args);
            break;
            
          default:
            throw new ValidationError(`Unknown tool: ${toolName}`);
        }
        
        // Format result according to MCP
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error) {
        logger.error('Error handling call tool request:', error);
        
        // Return error response
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              error: error.message,
              resolution: error.resolution || 'Please try again'
            }, null, 2)
          }],
          isError: true
        };
      }
    });
  }
  
  // Start the server
  async run() {
    try {
      logger.info('Starting YNAB MCP server...');
      
      // Set up error handler
      this.server.onerror = (error) => {
        logger.error('Server error:', error);
      };
      
      // Connect to stdio
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('YNAB MCP server running and connected via stdio');
    } catch (error) {
      logger.error('Fatal server error:', error);
      throw error;
    }
  }
}

// Create and run server
const server = new YnabServer();
server.run().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});