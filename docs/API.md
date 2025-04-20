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

**Example Transaction Object**:
```json
{
  "account_id": "account-id-here",
  "date": "2025-04-20",
  "amount": -15000,  // In milliunits: -$15.00
  "payee_name": "Starbucks",
  "category_id": "category-id-here",
  "memo": "Coffee with colleague",
  "cleared": "cleared"
}
```

### update_transaction
Update an existing transaction.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `transactionId`: ID of the transaction
- `transaction`: Transaction object with properties to update

**Response**: Updated transaction object

### bulk_create_transactions
Create multiple transactions at once.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `transactions`: Array of transaction objects

**Response**: Object with transaction IDs and any duplicates detected

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

### get_payee_transactions
Get transactions for a specific payee.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `payeeId`: ID of the payee

**Response**: Array of transactions for the specified payee

## Month Operations

### list_months
List all budget months with summary information.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget

**Response**: Array of month objects with budget summary information

### get_month
Get detailed information about a specific budget month.

**Parameters**:
- `email`: Account identifier
- `budgetId`: ID of the budget
- `month`: Month in ISO format (e.g., "2025-04")

**Response**: Month details including category budgets, income, and spending

## Notes on Currency Values

- All monetary values in the YNAB API are represented in "milliunits" (thousandths of the currency unit)
- For example, $10.00 is represented as 10000
- The API returns both raw values (`amount`) and formatted values (`amount_formatted`) for convenience
- When updating or creating records, you can either:
  - Provide amount values directly in milliunits
  - Provide decimal values (e.g., 10.00), which will be converted to milliunits automatically

## Authentication Flow

1. Call `authenticate_ynab_account` with an email identifier
2. Receive an authentication URL to open in a browser
3. Complete OAuth authentication in the browser
4. Retrieve the authorization code provided by YNAB
5. Call `authenticate_ynab_account` again with the email and `auth_code`
6. Authentication is complete, and you can now access YNAB data