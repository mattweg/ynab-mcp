# YNAB MCP Fixes

This document summarizes the issues we've identified and the fixes implemented in the YNAB MCP integration.

## Issues Fixed

### 1. Transaction API Date Handling (`fix-transactions-api` branch)

**Problem:**
- The transactions API was failing with "invalid date" errors when using the `sinceDate` parameter
- There was a parameter name mismatch between camelCase (`sinceDate`) in the API schema and snake_case (`since_date`) in the implementation

**Solution:**
- Updated the transactions API implementation to properly handle date parameters
- Simplified date handling by passing dates directly to the YNAB SDK
- Added support for both camelCase and snake_case parameter names
- Implemented proper client-side limit handling

### 2. Missing API Tools (`fix-mcp-registration` branch)

**Problem:**
- Several API tools defined in the source code weren't available through the MCP integration
- The schema.js and toolDefinitions.js files had inconsistencies

**Solution:**
- Updated the schema.js file to consistently use camelCase parameter names
- Ensured all API tools are properly registered and available

## Findings

### YNAB Date Format Requirements

- The YNAB API accepts dates in ISO format (YYYY-MM-DD) as strings
- It also accepts JavaScript Date objects and handles the conversion internally
- The API will reject invalidly formatted dates with a 400 error

### YNAB API Limit Handling

- The YNAB API doesn't support a `limit` parameter directly
- We implemented client-side limiting by slicing the results array

## Testing

We created a debug-transactions.js script to test direct interactions with the YNAB API outside of the MCP integration. This helped identify the core issues with date handling.

## Next Steps

1. **Complete the MCP Integration Registry Updates:**
   - Ensure consistent parameter naming across tools
   - Test all tools with the Claude Code MCP integration

2. **Authentication Improvements:**
   - Handle token refresh errors gracefully
   - Add better diagnostics for authentication failures

3. **Add Transaction Categorization Support:**
   - Implement tools for automatic categorization of transactions
   - Integrate with other MCP tools for enhanced functionality