# YNAB MCP Test Plan

## Overview

This document outlines the testing approach for validating the YNAB MCP server implementation. The test plan covers both standalone testing and integration testing with Claude.

## Standalone Testing

### Unit Tests

1. **Authentication Module**
   - Test token storage and retrieval
   - Test token refresh mechanism
   - Test OAuth URL generation

2. **API Modules**
   - Test response formatting
   - Test error handling
   - Test parameter validation

3. **MCP Handler**
   - Test tool routing
   - Test input validation
   - Test response formatting

### Integration Tests

1. **End-to-End Flow**
   - Test OAuth authentication flow
   - Test budget listing and retrieval
   - Test transaction creation and modification

2. **Rate Limiting**
   - Test rate limit handling
   - Test queuing of requests when approaching limits

3. **Error Scenarios**
   - Test invalid authentication
   - Test expired tokens
   - Test malformed requests

## Claude Integration Testing

### Setup

1. Start the YNAB MCP server
2. Connect Claude to the server using the wrapper script
3. Verify successful initialization

### Authentication

1. **New Authentication**
   - Ask Claude to check YNAB account status
   - Claude should identify no authenticated accounts
   - Claude should initiate authentication flow
   - Complete OAuth process and provide auth code
   - Verify successful authentication

2. **Using Existing Authentication**
   - Ask Claude to check YNAB account status
   - Claude should identify existing authenticated account
   - Claude should proceed with YNAB operations

### Budget Operations

1. **List Budgets**
   - Ask Claude to list all YNAB budgets
   - Verify budgets are displayed correctly

2. **Get Budget Details**
   - Ask Claude to show details of a specific budget
   - Verify the details are accurate
   - Check that all accounts are listed

### Transaction Operations

1. **List Transactions**
   - Ask Claude to list recent transactions
   - Ask for transactions with filters (date, account, category)
   - Verify transactions are displayed correctly

2. **Create Transaction**
   - Ask Claude to create a new transaction
   - Provide necessary details
   - Verify transaction creation
   - Check transaction appears in YNAB web interface

3. **Update Transaction**
   - Ask Claude to modify an existing transaction
   - Change category or amount
   - Verify changes are reflected

### Complex Scenarios

1. **Financial Analysis**
   - Ask Claude to analyze spending patterns
   - Request a category breakdown
   - Get budget vs actual spending comparison

2. **Multiple Operations**
   - Ask Claude to perform a series of related operations
   - Verify correct execution order
   - Check for consistent data handling

3. **Error Handling**
   - Deliberately trigger API errors
   - Verify Claude provides helpful error explanations
   - Check recovery suggestions

## Performance Testing

1. **Response Time**
   - Measure time to complete common operations
   - Test with varying data volumes

2. **Caching Efficiency**
   - Test repeated requests for same data
   - Verify cache hit rate

## Security Testing

1. **Token Management**
   - Verify tokens are stored securely
   - Test token refresh mechanism
   - Verify expired tokens are handled correctly

2. **Error Information**
   - Verify error messages don't leak sensitive information
   - Check logging redacts sensitive data

## Acceptance Criteria

The YNAB MCP integration is considered successful when:

1. Claude can successfully authenticate with YNAB
2. All key YNAB operations can be performed through Claude
3. Error scenarios are handled gracefully
4. Performance meets acceptable standards
5. Security requirements are satisfied