/**
 * MCP Protocol Schema Definitions for YNAB integration
 * Defines function signatures and parameters
 */

const schema = {
  functions: [
    {
      name: "list_ynab_accounts",
      description: "List all configured YNAB accounts and their authentication status",
      parameters: {}
    },
    {
      name: "authenticate_ynab_account",
      description: "Add and authenticate a YNAB account for API access",
      parameters: {
        email: {
          description: "Email/identifier for the account",
          type: "string",
          required: true
        },
        auth_code: {
          description: "Authorization code from YNAB OAuth (for initial authentication)",
          type: "string",
          required: false
        }
      }
    },
    {
      name: "remove_ynab_account",
      description: "Remove a YNAB account and delete its associated tokens",
      parameters: {
        email: {
          description: "Email/identifier of the account to remove",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "list_budgets",
      description: "List all available budgets for the authenticated account",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_budget",
      description: "Get detailed information about a specific budget",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget to retrieve",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_budget_settings",
      description: "Get settings for a specific budget",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "list_accounts",
      description: "List all accounts in a budget",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_account",
      description: "Get details about a specific account",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        accountId: {
          description: "ID of the account",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "list_categories",
      description: "List all categories in a budget",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_category",
      description: "Get details about a specific category",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        categoryId: {
          description: "ID of the category",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "update_category",
      description: "Update a category's budgeted amount",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        categoryId: {
          description: "ID of the category",
          type: "string",
          required: true
        },
        month: {
          description: "Month in ISO format (e.g., \"2025-04\")",
          type: "string",
          required: true
        },
        budgeted: {
          description: "Budgeted amount in milliunits",
          type: "number",
          required: true
        }
      }
    },
    {
      name: "list_transactions",
      description: "List transactions with optional filtering",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        sinceDate: {
          description: "Only return transactions after this date (YYYY-MM-DD format)",
          type: "string",
          required: false
        },
        type: {
          description: "Transaction type filter (\"uncategorized\", \"unapproved\")",
          type: "string",
          required: false
        },
        accountId: {
          description: "Filter by account ID",
          type: "string",
          required: false
        },
        categoryId: {
          description: "Filter by category ID",
          type: "string",
          required: false
        },
        payeeId: {
          description: "Filter by payee ID",
          type: "string",
          required: false
        }
      }
    },
    {
      name: "get_transaction",
      description: "Get details about a specific transaction",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        transactionId: {
          description: "ID of the transaction",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "create_transaction",
      description: "Create a new transaction",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        transaction: {
          description: "Transaction object with date, amount, accountId, etc.",
          type: "object",
          required: true
        }
      }
    },
    {
      name: "update_transaction",
      description: "Update an existing transaction",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        transactionId: {
          description: "ID of the transaction",
          type: "string",
          required: true
        },
        transaction: {
          description: "Transaction object with properties to update",
          type: "object",
          required: true
        }
      }
    },
    {
      name: "bulk_create_transactions",
      description: "Create multiple transactions at once",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        transactions: {
          description: "Array of transaction objects",
          type: "array",
          required: true
        }
      }
    },
    {
      name: "list_payees",
      description: "List all payees in a budget",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_payee",
      description: "Get details about a specific payee",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        payeeId: {
          description: "ID of the payee",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_payee_transactions",
      description: "Get transactions for a specific payee",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        payeeId: {
          description: "ID of the payee",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "list_months",
      description: "List all budget months",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        }
      }
    },
    {
      name: "get_month",
      description: "Get details about a specific budget month",
      parameters: {
        email: {
          description: "Account identifier",
          type: "string",
          required: true
        },
        budgetId: {
          description: "ID of the budget",
          type: "string",
          required: true
        },
        month: {
          description: "Month in ISO format (e.g., \"2025-04\")",
          type: "string",
          required: true
        }
      }
    }
  ]
};

module.exports = schema;