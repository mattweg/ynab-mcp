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

// Define all available tools
const ynabTools = [
  // Authentication tools
  {
    name: "list_ynab_accounts",
    description: "List all authenticated YNAB accounts",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "authenticate_ynab_account",
    description: "Authenticate a YNAB account",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address for the YNAB account (used as account identifier)"
        },
        auth_code: {
          type: "string",
          description: "Authorization code from YNAB OAuth (for completing authentication)"
        }
      },
      required: ["email"]
    }
  },
  {
    name: "remove_ynab_account",
    description: "Remove a YNAB account and delete its tokens",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address of the YNAB account to remove"
        }
      },
      required: ["email"]
    }
  },
  
  // Budget tools
  {
    name: "list_budgets",
    description: "List all budgets for the authenticated YNAB account",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address of the authenticated YNAB account"
        }
      },
      required: ["email"]
    }
  },
  {
    name: "get_budget",
    description: "Get details of a specific budget",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address of the authenticated YNAB account"
        },
        budgetId: {
          type: "string",
          description: "ID of the budget to retrieve"
        }
      },
      required: ["email", "budgetId"]
    }
  }
  // Add more tools as needed but keeping minimal for now
];

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
          case 'list_budgets':
            result = await budgetsApi.listBudgets(args);
            break;
          case 'get_budget':
            result = await budgetsApi.getBudget(args);
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