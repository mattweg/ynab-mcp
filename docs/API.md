# API Reference

This document describes the MCP API methods available for YNAB integration.

## Authentication

### list_ynab_accounts
Lists all configured YNAB accounts and their authentication status.

**Parameters**: None

**Response**: Array of account objects with authentication status

### authenticate_ynab_account
Add and authenticate a YNAB account for API access.

**Parameters**:
- `email`: Email/identifier for the account
- `auth_code`: (Optional) Authorization code from YNAB OAuth

**Response**: Authentication URL or success message

### remove_ynab_account
Remove a YNAB account and delete its associated tokens.

**Parameters**:
- `email`: Email/identifier of the account to remove

**Response**: Success message

## Budget Operations

### list_budgets
List all available budgets for the authenticated account.

**Parameters**:
- `email`: Account identifier

**Response**: Array of budget objects

### get_budget
Get detailed information about a specific budget.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget to retrieve

**Response**: Budget details including accounts, categories, etc.

### get_budget_settings
Get settings for a specific budget.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget

**Response**: Budget settings including currency format, date format, etc.

## Account Operations

### list_accounts
List all accounts in a budget.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget

**Response**: Array of account objects

### get_account
Get details about a specific account.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `accountId`: ID of the account

**Response**: Account details including balance, type, etc.

## Category Operations

### list_categories
List all categories in a budget.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget

**Response**: Array of category group and category objects

### get_category
Get details about a specific category.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `categoryId`: ID of the category

**Response**: Category details including budgeted amount, activity, etc.

### update_category
Update a category's budgeted amount.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `categoryId`: ID of the category
- `month`: Month in ISO format (e.g., "2025-04")
- `budgeted`: Budgeted amount in milliunits

**Response**: Updated category object

## Transaction Operations

### list_transactions
List transactions with optional filtering.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `since_date`: (Optional) Only return transactions after this date
- `type`: (Optional) Transaction type filter ("uncategorized", "unapproved")
- `accountId`: (Optional) Filter by account ID
- `categoryId`: (Optional) Filter by category ID
- `payeeId`: (Optional) Filter by payee ID

**Response**: Array of transaction objects

### get_transaction
Get details about a specific transaction.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `transactionId`: ID of the transaction

**Response**: Transaction details

### create_transaction
Create a new transaction.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `transaction`: Transaction object with date, amount, accountId, etc.

**Response**: Created transaction object

### update_transaction
Update an existing transaction.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `transactionId`: ID of the transaction
- `transaction`: Transaction object with properties to update

**Response**: Updated transaction object

## Payee Operations

### list_payees
List all payees in a budget.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget

**Response**: Array of payee objects

### get_payee
Get details about a specific payee.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `payeeId`: ID of the payee

**Response**: Payee details

## Reporting Operations

### get_spending_report
Get a spending report by category.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `startDate`: Start date in ISO format
- `endDate`: End date in ISO format

**Response**: Spending report with categories and amounts

### get_budget_health
Get overall budget health metrics.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget

**Response**: Budget health metrics including age of money, underfunded categories, etc.