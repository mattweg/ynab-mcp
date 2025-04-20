# YNAB MCP Implementation

This directory contains the MCP (Model Context Protocol) implementation for YNAB (You Need A Budget), allowing Claude to interact with YNAB accounts directly.

## Overview

The implementation uses the official MCP SDK to create a Standards-compliant MCP server that communicates with Claude via StdioServerTransport (stdin/stdout). The server provides a set of tools for interacting with YNAB, including authentication, budget management, and transaction handling.

## Quick Start

To use this MCP with Claude:

```bash
/path/to/ynab-mcp/wrapper.sh
```

The wrapper script builds a Docker container and connects Claude to the YNAB MCP server.

## Implementation Details

- Uses the official `@modelcontextprotocol/sdk` package
- Implements the StdioServerTransport for direct communication with Claude
- Provides a comprehensive set of tools for YNAB operations
- Handles authentication via OAuth
- Maintains persistent tokens across sessions

## Tools

The server provides the following tools:

### Authentication
- `list_ynab_accounts` - List authenticated accounts
- `authenticate_ynab_account` - Add/authenticate a YNAB account
- `remove_ynab_account` - Remove a YNAB account

### Budgets
- `list_budgets` - List all budgets for an account
- `get_budget` - Get details of a specific budget
- `get_budget_settings` - Get settings for a specific budget

### Accounts
- `list_accounts` - List all accounts in a budget
- `get_account` - Get details of a specific account

### Transactions
- `list_transactions` - List transactions with optional filtering
- `get_transaction` - Get details of a specific transaction
- `create_transaction` - Create a new transaction
- `update_transaction` - Update an existing transaction
- `bulk_create_transactions` - Create multiple transactions at once

### Categories
- `list_categories` - List all categories in a budget
- `get_category` - Get details of a specific category
- `update_category` - Update a category

## Docker Configuration

The implementation uses Docker for containerization:

- Base image: `node:20-alpine`
- Volumes:
  - `/app/config` - Configuration files
  - `/app/data` - Persistent token storage
- Environment variables:
  - `NODE_ENV` - Set to "production" by default

## Requirements

- Docker
- Valid YNAB account
- YNAB Developer API credentials (in config.js)

## Documentation

- `IMPLEMENTATION.md` - Detailed implementation notes
- `TEST_PLAN.md` - Plan for testing with Claude
- `CLAUDE_USAGE.md` - Guide for using YNAB with Claude
- `NEXT_STEPS.md` - Remaining tasks and improvements