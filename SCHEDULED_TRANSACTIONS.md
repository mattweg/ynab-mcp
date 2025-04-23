# YNAB Scheduled Transactions API

The YNAB MCP server now supports the YNAB Scheduled Transactions API, allowing you to create, view, update, and delete scheduled transactions. This is particularly useful for setting up recurring transactions in the future, since the regular transactions API doesn't allow creating transactions with future dates.

## Available Functions

### 1. List Scheduled Transactions

```javascript
mcp__ynab__list_scheduled_transactions({
  email: "your-email@example.com",
  budgetId: "your-budget-id"
})
```

Returns a list of all scheduled transactions for the specified budget.

### 2. Get Scheduled Transaction

```javascript
mcp__ynab__get_scheduled_transaction({
  email: "your-email@example.com",
  budgetId: "your-budget-id",
  scheduledTransactionId: "scheduled-transaction-id"
})
```

Returns details of a specific scheduled transaction.

### 3. Create Scheduled Transaction

```javascript
mcp__ynab__create_scheduled_transaction({
  email: "your-email@example.com",
  budgetId: "your-budget-id",
  scheduledTransaction: {
    account_id: "account-id",
    date_first: "2025-04-26",  // Can be a future date!
    frequency: "monthly",      // See frequency options below
    amount: -150000,           // Negative for outflow, positive for inflow, in milliunits
    payee_name: "Example Payee",
    category_id: "category-id",
    memo: "Scheduled transaction example"
  }
})
```

Creates a new scheduled transaction. Unlike regular transactions, these can have future dates.

#### Frequency Options

The `frequency` field can be one of the following values:
- `never` - Transaction does not repeat
- `daily` - Transaction repeats daily
- `weekly` - Transaction repeats weekly
- `everyOtherWeek` - Transaction repeats every other week
- `twiceAMonth` - Transaction repeats twice a month
- `every4Weeks` - Transaction repeats every four weeks
- `monthly` - Transaction repeats monthly
- `everyOtherMonth` - Transaction repeats every other month
- `every3Months` - Transaction repeats every three months
- `every4Months` - Transaction repeats every four months
- `twiceAYear` - Transaction repeats twice a year
- `yearly` - Transaction repeats yearly
- `everyOtherYear` - Transaction repeats every other year

### 4. Update Scheduled Transaction

```javascript
mcp__ynab__update_scheduled_transaction({
  email: "your-email@example.com",
  budgetId: "your-budget-id",
  scheduledTransactionId: "scheduled-transaction-id",
  scheduledTransaction: {
    amount: -200000,           // Updated amount
    memo: "Updated memo"       // Updated memo
  }
})
```

Updates an existing scheduled transaction. You only need to include the fields you want to update.

### 5. Delete Scheduled Transaction

```javascript
mcp__ynab__delete_scheduled_transaction({
  email: "your-email@example.com",
  budgetId: "your-budget-id",
  scheduledTransactionId: "scheduled-transaction-id"
})
```

Deletes a scheduled transaction.

## Using Scheduled Transactions vs Regular Transactions

- Use **regular transactions** for transactions that have already occurred or will occur in the very near future.
- Use **scheduled transactions** for:
  - Recurring bills or income that you want to plan for
  - Future-dated transactions (beyond the regular transaction API's limitation)
  - Setting up payment schedules

## Example Use Case

Instead of creating a regular transaction with today's date but intended for the future:

```javascript
// Not ideal - using current date for a future transaction
mcp__ynab__create_transaction({
  email: "your-email@example.com",
  budgetId: "your-budget-id",
  transaction: {
    account_id: "account-id",
    date: "2025-04-20",  // Today's date as a workaround
    amount: 5598560,
    payee_name: "Amazon",
    memo: "Paycheck (Originally planned for: 2025-04-26)",  // Noting the intended date in the memo
    category_id: "income-category-id"
  }
})
```

Now you can create an actual scheduled transaction for the future date:

```javascript
// Better - using actual future date with scheduled transaction
mcp__ynab__create_scheduled_transaction({
  email: "your-email@example.com",
  budgetId: "your-budget-id",
  scheduledTransaction: {
    account_id: "account-id",
    date_first: "2025-04-26",  // Actual future date
    frequency: "never",        // One-time scheduled transaction
    amount: 5598560,
    payee_name: "Amazon",
    memo: "Paycheck",
    category_id: "income-category-id"
  }
})
```