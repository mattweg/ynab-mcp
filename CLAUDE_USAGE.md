# Using YNAB with Claude

This guide explains how to interact with your YNAB (You Need A Budget) accounts through Claude.

## Getting Started

Before using YNAB with Claude, you need to have:

1. A YNAB account (free or paid)
2. The YNAB MCP server running
3. Claude configured to use the MCP server

## Common Tasks

### Authentication

When first using YNAB, Claude will check if you're authenticated:

```
You: Show me my YNAB budgets

Claude: I need to authenticate with YNAB first. Please use this link to authorize access:
[Authorization URL]

After authorizing, you'll receive a code. Please provide that code to me.

You: [paste authorization code]

Claude: Thanks! I've successfully authenticated with YNAB.
```

### Managing Budgets

#### List Budgets

```
You: Show me my YNAB budgets

Claude: Here are your YNAB budgets:
1. Personal Budget
2. Family Budget
3. Business Expenses
```

#### Get Budget Details

```
You: Show me the details of my Personal Budget

Claude: Here's a summary of your Personal Budget:
- Last updated: April 15, 2024
- Accounts: 5
- Categories: 42
- Current month budgeted: $4,200
- Current month activity: $2,135
```

### Managing Transactions

#### List Recent Transactions

```
You: Show me my recent transactions

Claude: Here are your 10 most recent transactions:
1. Walmart - $56.78 (Groceries) - April 18, 2024
2. Amazon - $29.99 (Household) - April 17, 2024
...
```

#### Create a Transaction

```
You: Add a new transaction to my Personal Budget

Claude: I'll help you add a new transaction. Please provide the following details:
- Account name?
- Payee name?
- Amount?
- Date?
- Category?

You: Chase Checking, Starbucks, $4.85, today, Coffee Shops

Claude: I've added a transaction to your Chase Checking account:
- Payee: Starbucks
- Amount: $4.85
- Date: April 20, 2024
- Category: Coffee Shops
```

### Financial Analysis

```
You: How much did I spend on groceries last month?

Claude: Looking at your March 2024 spending:
You spent $482.37 on Groceries, which is $17.63 under your budget of $500.00.

This represents about 14% of your total spending for the month.
```

## Tips for Getting the Best Results

1. **Be specific in your requests**: Include account names, budget names, and date ranges when relevant.

2. **Start with authentication**: It's good to ask Claude to check your YNAB account status before making specific requests.

3. **Use natural language**: You can ask questions conversationally like "How much did I spend at Amazon last month?" or "What's my checking account balance?"

4. **Combine analysis requests**: You can ask Claude to analyze your spending patterns or suggest budget improvements based on your transaction history.

5. **Follow up for details**: If Claude provides a summary, you can ask for more detailed information about any part of it.

## Troubleshooting

If you encounter issues:

1. **Authentication problems**: Try removing your account with "Please remove my YNAB account" and then start fresh.

2. **Outdated data**: Ask Claude to "refresh YNAB data" if you've made changes in the YNAB app.

3. **Rate limits**: YNAB limits API requests to 200 per hour. If you hit this limit, wait a while before trying again.

4. **Server connection issues**: Ensure the YNAB MCP server is running correctly.

## Privacy and Security

- Your YNAB authentication tokens are stored securely on the server.
- Claude can only access the YNAB data that you've authorized.
- No sensitive financial information is stored in Claude's memory after your session.
- You can revoke access at any time from your YNAB account settings.