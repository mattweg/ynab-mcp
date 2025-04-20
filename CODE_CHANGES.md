# YNAB MCP: Key Code Changes

This document highlights the most important code changes in the PR, focusing on implementation rather than documentation.

## Core Implementation Files

1. **`src/server.js`**
   - Implemented MCP server using `@modelcontextprotocol/sdk`
   - Set up StdioServerTransport for Claude communication
   - Added tool registrations and schema definitions
   - Implemented proper error handling

2. **`src/tools/auth.js`**
   - Implemented OAuth flow for YNAB authentication
   - Created token storage and retrieval functions
   - Added refresh token mechanism
   - Built account management tools

3. **`src/tools/budgets.js`**
   - Implemented budget listing functionality
   - Built budget details retrieval
   - Added account information access

4. **`src/utils/api.js`**
   - Created YNAB API client wrapper
   - Implemented rate limiting logic
   - Added automatic token refresh before API calls
   - Built request queuing system

## Configuration Changes

1. **`Dockerfile`**
   - Added Node.js 20 base image
   - Set up proper volume mounting for token persistence
   - Configured environment variables

2. **`ynab-mcp-config.json`**
   - Created MCP configuration for Emma integration
   - Set up container parameters
   - Configured volume mapping

## Authentication Flow

The authentication implementation includes:

```javascript
// Authentication initialization
function generateAuthUrl(email) {
  const clientId = process.env.YNAB_CLIENT_ID;
  const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
  return `https://app.youneedabudget.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
}

// Token exchange after user provides auth code
async function exchangeToken(authCode) {
  const response = await axios.post('https://app.youneedabudget.com/oauth/token', {
    client_id: process.env.YNAB_CLIENT_ID,
    client_secret: process.env.YNAB_CLIENT_SECRET,
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    grant_type: 'authorization_code',
    code: authCode
  });
  
  return response.data;
}
```

## Budget Operations

The budget-related tools include:

```javascript
// List all budgets
async function listBudgets({ email }) {
  const api = getApiClient(email);
  const response = await api.budgets.getBudgets();
  
  return {
    budgets: response.data.budgets,
    default_budget: response.data.default_budget?.id || response.data.budgets[0]?.id
  };
}

// Get specific budget details
async function getBudget({ email, budgetId }) {
  const api = getApiClient(email);
  const response = await api.budgets.getBudgetById(budgetId);
  
  return response.data.budget;
}
```

## Tool Definitions

The MCP tool definitions are structured as:

```javascript
const toolSchema = {
  list_ynab_accounts: {
    description: "List all authenticated YNAB accounts",
    parameters: {
      properties: {},
      type: "object"
    }
  },
  authenticate_ynab_account: {
    description: "Authenticate a YNAB account",
    parameters: {
      properties: {
        email: {
          description: "Email address for the YNAB account",
          type: "string"
        },
        auth_code: {
          description: "Authorization code from YNAB OAuth",
          type: "string"
        }
      },
      required: ["email"],
      type: "object"
    }
  },
  // Additional tool definitions...
};
```

## Test Files

1. **`tests/unit/auth.test.js`**
   - Tests for authentication functions
   - Token storage and retrieval tests
   - OAuth URL generation tests

2. **`tests/integration/server.test.js`**
   - End-to-end server testing
   - MCP protocol communication tests
   - Tool execution verification

-Emma 🌟