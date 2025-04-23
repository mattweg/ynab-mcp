/**
 * YNAB MCP Tool Definitions
 * Defines all available tools for use with the MCP SDK
 */

// Tool categories
const CATEGORIES = {
  AUTHENTICATION: 'Authentication',
  BUDGETS: 'Budgets',
  ACCOUNTS: 'Accounts',
  CATEGORIES: 'Categories',
  TRANSACTIONS: 'Transactions',
  SCHEDULED_TRANSACTIONS: 'Scheduled Transactions',
  PAYEES: 'Payees',
  MONTHS: 'Months'
};

// Authentication tools
const authTools = [
  {
    name: 'list_ynab_accounts',
    category: CATEGORIES.AUTHENTICATION,
    description: `List all authenticated YNAB accounts.
    
    IMPORTANT: This tool MUST be called first before any other YNAB operations to:
    1. Check for existing authenticated accounts
    2. Verify token validity
    
    Common Response Patterns:
    - Valid account exists → Proceed with requested operation 
    - No accounts exist → Start authentication flow`,
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'authenticate_ynab_account',
    category: CATEGORIES.AUTHENTICATION,
    description: `Add and authenticate a YNAB account for API access.
    
    IMPORTANT: Only use this tool if list_ynab_accounts shows no existing accounts
    
    Steps to complete authentication:
    1. You call with required email address
    2. You receive auth_url in response
    3. You share EXACT auth_url with user in a clickable URL form
    4. User completes OAuth flow by clicking on the link
    5. User provides auth_code back to you
    6. Complete authentication with auth_code`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address for the YNAB account (used as account identifier)'
        },
        auth_code: {
          type: 'string',
          description: 'Authorization code from YNAB OAuth (for completing authentication)'
        }
      },
      required: ['email']
    }
  },
  {
    name: 'remove_ynab_account',
    category: CATEGORIES.AUTHENTICATION,
    description: 'Remove a YNAB account and delete its associated authentication tokens',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the YNAB account to remove'
        }
      },
      required: ['email']
    }
  }
];

// Budget tools
const budgetTools = [
  {
    name: 'list_budgets',
    category: CATEGORIES.BUDGETS,
    description: 'List all budgets for the authenticated YNAB account',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        }
      },
      required: ['email']
    }
  },
  {
    name: 'get_budget',
    category: CATEGORIES.BUDGETS,
    description: 'Get details of a specific budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget to retrieve'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_budget_settings',
    category: CATEGORIES.BUDGETS,
    description: 'Get settings for a specific budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget to retrieve settings for'
        }
      },
      required: ['email', 'budgetId']
    }
  }
];

// Account tools
const accountTools = [
  {
    name: 'list_accounts',
    category: CATEGORIES.ACCOUNTS,
    description: 'List all accounts in a specific budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the accounts'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_account',
    category: CATEGORIES.ACCOUNTS,
    description: 'Get details of a specific account in a budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the account'
        },
        accountId: {
          type: 'string',
          description: 'ID of the account to retrieve'
        }
      },
      required: ['email', 'budgetId', 'accountId']
    }
  }
];

// Category tools
const categoryTools = [
  {
    name: 'list_categories',
    category: CATEGORIES.CATEGORIES,
    description: 'List all categories in a specific budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the categories'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_category',
    category: CATEGORIES.CATEGORIES,
    description: 'Get details of a specific category in a budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the category'
        },
        categoryId: {
          type: 'string',
          description: 'ID of the category to retrieve'
        }
      },
      required: ['email', 'budgetId', 'categoryId']
    }
  },
  {
    name: 'update_category',
    category: CATEGORIES.CATEGORIES,
    description: 'Update a specific category in a budget (name, budgeted amount, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the category'
        },
        categoryId: {
          type: 'string',
          description: 'ID of the category to update'
        },
        name: {
          type: 'string',
          description: 'New name for the category (optional)'
        },
        budgeted: {
          type: 'number',
          description: 'The new budgeted amount in milliunits (optional)'
        },
        note: {
          type: 'string',
          description: 'New note for the category (optional)'
        }
      },
      required: ['email', 'budgetId', 'categoryId']
    }
  },
  {
    name: 'assign_to_categories',
    category: CATEGORIES.CATEGORIES,
    description: `Assign budget from Ready to Assign to multiple categories.
    
    This tool intelligently allocates funds from your Ready to Assign balance to specific categories.
    It performs validation to ensure you don't exceed available funds, and provides detailed results
    of each allocation with before/after values.
    
    Common usage:
    - Distribute newly received income to multiple categories
    - Fill underfunded categories quickly
    - Apply a budget template to multiple categories at once`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget to work with'
        },
        month: {
          type: 'string',
          description: 'Month in ISO format (YYYY-MM)'
        },
        categoryAllocations: {
          type: 'array',
          description: 'Array of category allocations to apply',
          items: {
            type: 'object',
            properties: {
              categoryId: {
                type: 'string',
                description: 'ID of the category to allocate funds to'
              },
              amount: {
                type: 'number',
                description: 'Amount to allocate (in dollars or milliunits)'
              }
            },
            required: ['categoryId', 'amount']
          }
        }
      },
      required: ['email', 'budgetId', 'month', 'categoryAllocations']
    }
  },
  {
    name: 'get_recommended_allocations',
    category: CATEGORIES.CATEGORIES,
    description: `Get AI-powered recommendations for category allocations.
    
    This tool analyzes your budget patterns and provides intelligent recommendations
    for how to allocate your Ready to Assign funds. Recommendations are prioritized based on:
    
    1. Underfunded goals (highest priority)
    2. Essential categories with negative balances
    3. Regular spending categories with insufficient funds
    4. Savings goals (lowest priority)
    
    Each recommendation includes the amount, reason, and priority level.`,
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget to analyze'
        },
        month: {
          type: 'string',
          description: 'Month in ISO format (YYYY-MM)'
        },
        availableAmount: {
          type: 'number',
          description: 'Optional override for available amount to allocate (in milliunits)'
        }
      },
      required: ['email', 'budgetId', 'month']
    }
  }
];

// Transaction tools
const transactionTools = [
  {
    name: 'list_transactions',
    category: CATEGORIES.TRANSACTIONS,
    description: 'List transactions with optional filtering by account, date, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the transactions'
        },
        accountId: {
          type: 'string',
          description: 'Filter transactions by account ID (optional)'
        },
        sinceDate: {
          type: 'string',
          description: 'Filter transactions since this date (YYYY-MM-DD format, optional)'
        },
        type: {
          type: 'string',
          enum: ['uncategorized', 'unapproved'],
          description: 'Filter by transaction type (optional)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of transactions to return (optional)'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_transaction',
    category: CATEGORIES.TRANSACTIONS,
    description: 'Get details of a specific transaction',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the transaction'
        },
        transactionId: {
          type: 'string',
          description: 'ID of the transaction to retrieve'
        }
      },
      required: ['email', 'budgetId', 'transactionId']
    }
  },
  {
    name: 'create_transaction',
    category: CATEGORIES.TRANSACTIONS,
    description: 'Create a new transaction in a budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget for the transaction'
        },
        transaction: {
          type: 'object',
          properties: {
            account_id: {
              type: 'string',
              description: 'ID of the account for the transaction'
            },
            date: {
              type: 'string',
              description: 'Transaction date in ISO format (YYYY-MM-DD)'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount in milliunits (negative for outflow, positive for inflow)'
            },
            payee_id: {
              type: 'string',
              description: 'ID of the payee (optional)'
            },
            payee_name: {
              type: 'string',
              description: 'Name of the payee if payee_id not provided (optional)'
            },
            category_id: {
              type: 'string',
              description: 'ID of the category (optional)'
            },
            memo: {
              type: 'string',
              description: 'Memo/note for the transaction (optional)'
            },
            cleared: {
              type: 'string',
              enum: ['cleared', 'uncleared', 'reconciled'],
              description: 'Cleared status (optional)'
            },
            approved: {
              type: 'boolean',
              description: 'Whether the transaction is approved (optional)'
            },
            flag_color: {
              type: 'string',
              enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
              description: 'Flag color (optional)'
            }
          },
          required: ['account_id', 'date', 'amount']
        }
      },
      required: ['email', 'budgetId', 'transaction']
    }
  },
  {
    name: 'update_transaction',
    category: CATEGORIES.TRANSACTIONS,
    description: 'Update an existing transaction',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the transaction'
        },
        transactionId: {
          type: 'string',
          description: 'ID of the transaction to update'
        },
        transaction: {
          type: 'object',
          properties: {
            account_id: {
              type: 'string',
              description: 'ID of the account for the transaction (optional)'
            },
            date: {
              type: 'string',
              description: 'Transaction date in ISO format (YYYY-MM-DD) (optional)'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount in milliunits (negative for outflow, positive for inflow) (optional)'
            },
            payee_id: {
              type: 'string',
              description: 'ID of the payee (optional)'
            },
            payee_name: {
              type: 'string',
              description: 'Name of the payee if payee_id not provided (optional)'
            },
            category_id: {
              type: 'string',
              description: 'ID of the category (optional)'
            },
            memo: {
              type: 'string',
              description: 'Memo/note for the transaction (optional)'
            },
            cleared: {
              type: 'string',
              enum: ['cleared', 'uncleared', 'reconciled'],
              description: 'Cleared status (optional)'
            },
            approved: {
              type: 'boolean',
              description: 'Whether the transaction is approved (optional)'
            },
            flag_color: {
              type: 'string',
              enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
              description: 'Flag color (optional)'
            }
          }
        }
      },
      required: ['email', 'budgetId', 'transactionId', 'transaction']
    }
  },
  {
    name: 'bulk_create_transactions',
    category: CATEGORIES.TRANSACTIONS,
    description: 'Create multiple transactions at once',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget for the transactions'
        },
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              account_id: {
                type: 'string',
                description: 'ID of the account for the transaction'
              },
              date: {
                type: 'string',
                description: 'Transaction date in ISO format (YYYY-MM-DD)'
              },
              amount: {
                type: 'number',
                description: 'Transaction amount in milliunits (negative for outflow, positive for inflow)'
              },
              payee_id: {
                type: 'string',
                description: 'ID of the payee (optional)'
              },
              payee_name: {
                type: 'string',
                description: 'Name of the payee if payee_id not provided (optional)'
              },
              category_id: {
                type: 'string',
                description: 'ID of the category (optional)'
              },
              memo: {
                type: 'string',
                description: 'Memo/note for the transaction (optional)'
              },
              cleared: {
                type: 'string',
                enum: ['cleared', 'uncleared', 'reconciled'],
                description: 'Cleared status (optional)'
              },
              approved: {
                type: 'boolean',
                description: 'Whether the transaction is approved (optional)'
              },
              flag_color: {
                type: 'string',
                enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
                description: 'Flag color (optional)'
              }
            },
            required: ['account_id', 'date', 'amount']
          }
        }
      },
      required: ['email', 'budgetId', 'transactions']
    }
  }
];

// Payee tools
const payeeTools = [
  {
    name: 'list_payees',
    category: CATEGORIES.PAYEES,
    description: 'List all payees in a budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the payees'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_payee',
    category: CATEGORIES.PAYEES,
    description: 'Get details of a specific payee',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the payee'
        },
        payeeId: {
          type: 'string',
          description: 'ID of the payee to retrieve'
        }
      },
      required: ['email', 'budgetId', 'payeeId']
    }
  },
  {
    name: 'get_payee_transactions',
    category: CATEGORIES.PAYEES,
    description: 'Get transactions for a specific payee',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the payee'
        },
        payeeId: {
          type: 'string',
          description: 'ID of the payee to retrieve transactions for'
        },
        sinceDate: {
          type: 'string',
          description: 'Filter transactions since this date (YYYY-MM-DD format, optional)'
        }
      },
      required: ['email', 'budgetId', 'payeeId']
    }
  }
];

// Month tools
const monthTools = [
  {
    name: 'list_months',
    category: CATEGORIES.MONTHS,
    description: 'List budget months',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget to list months for'
        },
        sinceDate: {
          type: 'string',
          description: 'Return months on or after this date (optional)'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_month',
    category: CATEGORIES.MONTHS,
    description: 'Get a specific budget month',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the month'
        },
        month: {
          type: 'string',
          description: 'The month to retrieve in ISO format (YYYY-MM-DD)'
        }
      },
      required: ['email', 'budgetId', 'month']
    }
  }
];

// Scheduled Transaction tools
const scheduledTransactionTools = [
  {
    name: 'list_scheduled_transactions',
    category: CATEGORIES.SCHEDULED_TRANSACTIONS,
    description: 'List all scheduled transactions for a budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the scheduled transactions'
        }
      },
      required: ['email', 'budgetId']
    }
  },
  {
    name: 'get_scheduled_transaction',
    category: CATEGORIES.SCHEDULED_TRANSACTIONS,
    description: 'Get details of a specific scheduled transaction',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the scheduled transaction'
        },
        scheduledTransactionId: {
          type: 'string',
          description: 'ID of the scheduled transaction to retrieve'
        }
      },
      required: ['email', 'budgetId', 'scheduledTransactionId']
    }
  },
  {
    name: 'create_scheduled_transaction',
    category: CATEGORIES.SCHEDULED_TRANSACTIONS,
    description: 'Create a new scheduled transaction in a budget',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget for the scheduled transaction'
        },
        scheduledTransaction: {
          type: 'object',
          properties: {
            account_id: {
              type: 'string',
              description: 'ID of the account for the scheduled transaction'
            },
            date_first: {
              type: 'string',
              description: 'First date of the scheduled transaction in ISO format (YYYY-MM-DD)'
            },
            frequency: {
              type: 'string',
              enum: ['never', 'daily', 'weekly', 'everyOtherWeek', 'twiceAMonth', 'every4Weeks', 'monthly', 'everyOtherMonth', 'every3Months', 'every4Months', 'twiceAYear', 'yearly', 'everyOtherYear'],
              description: 'How often the scheduled transaction repeats'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount in milliunits (negative for outflow, positive for inflow)'
            },
            payee_id: {
              type: 'string',
              description: 'ID of the payee (optional)'
            },
            payee_name: {
              type: 'string',
              description: 'Name of the payee if payee_id not provided (optional)'
            },
            category_id: {
              type: 'string',
              description: 'ID of the category (optional)'
            },
            memo: {
              type: 'string',
              description: 'Memo/note for the scheduled transaction (optional)'
            },
            flag_color: {
              type: 'string',
              enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
              description: 'Flag color (optional)'
            }
          },
          required: ['account_id', 'date_first', 'frequency', 'amount']
        }
      },
      required: ['email', 'budgetId', 'scheduledTransaction']
    }
  },
  {
    name: 'update_scheduled_transaction',
    category: CATEGORIES.SCHEDULED_TRANSACTIONS,
    description: 'Update an existing scheduled transaction',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the scheduled transaction'
        },
        scheduledTransactionId: {
          type: 'string',
          description: 'ID of the scheduled transaction to update'
        },
        scheduledTransaction: {
          type: 'object',
          properties: {
            account_id: {
              type: 'string',
              description: 'ID of the account for the scheduled transaction (optional)'
            },
            date_first: {
              type: 'string',
              description: 'First date of the scheduled transaction in ISO format (YYYY-MM-DD) (optional)'
            },
            frequency: {
              type: 'string',
              enum: ['never', 'daily', 'weekly', 'everyOtherWeek', 'twiceAMonth', 'every4Weeks', 'monthly', 'everyOtherMonth', 'every3Months', 'every4Months', 'twiceAYear', 'yearly', 'everyOtherYear'],
              description: 'How often the scheduled transaction repeats (optional)'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount in milliunits (negative for outflow, positive for inflow) (optional)'
            },
            payee_id: {
              type: 'string',
              description: 'ID of the payee (optional)'
            },
            payee_name: {
              type: 'string',
              description: 'Name of the payee if payee_id not provided (optional)'
            },
            category_id: {
              type: 'string',
              description: 'ID of the category (optional)'
            },
            memo: {
              type: 'string',
              description: 'Memo/note for the scheduled transaction (optional)'
            },
            flag_color: {
              type: 'string',
              enum: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
              description: 'Flag color (optional)'
            }
          }
        }
      },
      required: ['email', 'budgetId', 'scheduledTransactionId', 'scheduledTransaction']
    }
  },
  {
    name: 'delete_scheduled_transaction',
    category: CATEGORIES.SCHEDULED_TRANSACTIONS,
    description: 'Delete a scheduled transaction',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the authenticated YNAB account'
        },
        budgetId: {
          type: 'string',
          description: 'ID of the budget containing the scheduled transaction'
        },
        scheduledTransactionId: {
          type: 'string',
          description: 'ID of the scheduled transaction to delete'
        }
      },
      required: ['email', 'budgetId', 'scheduledTransactionId']
    }
  }
];

// Combine all tools
const ynabTools = [
  ...authTools,
  ...budgetTools,
  ...accountTools,
  ...categoryTools,
  ...transactionTools,
  ...scheduledTransactionTools,
  ...payeeTools,
  ...monthTools
];

module.exports = {
  ynabTools,
  categories: CATEGORIES
};