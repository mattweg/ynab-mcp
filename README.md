# YNAB MCP

YNAB Model Context Protocol (MCP) server for Claude Code integration with You Need A Budget (YNAB).

## Overview

This repository contains a Docker-based MCP server that enables Claude Code to interact with YNAB (You Need A Budget) accounts. It implements the OAuth flow and provides a comprehensive API for budget management, transaction tracking, and financial insights.

## Known Issues

### MCP Tool Availability
The following issues have been identified:
1. **Transactions API** - The `list_transactions` endpoint fails with "invalid date" errors when using the `sinceDate` parameter
2. **Missing API Tools** - Several endpoints that are defined in the source code are not available in the MCP integration
3. **Inconsistent Behavior** - Some tools work in testing with test-mcp.js but fail in the actual MCP integration

### Issue Tracking
We're actively working on the following fixes:
- `fix-transactions-api` branch: Addressing the date format handling in the transactions API
- `fix-mcp-registration` branch: Ensuring all API tools are properly registered and available

## Features

- OAuth-based authentication with YNAB API
- Complete budget and account management
- Transaction creation and categorization
- Advanced category management with bulk allocation and recommendations
- Support for multiple budgets (personal and family)
- Rate limit handling (YNAB API limit: 200 requests/hour)
- Caching for improved performance

### New Category Management Features

This MCP includes advanced category management capabilities:

- **Assign to Categories**: Allocate funds from Ready to Assign to multiple categories in one operation
- **Recommended Allocations**: Get AI-powered suggestions for budget distribution based on goals and spending patterns

See [Category Management Documentation](docs/category-management.md) for details.

## Getting Started

### Prerequisites

- Docker
- Node.js v18+ (for development)
- Claude Code CLI
- YNAB account

### Installation

1. Clone this repository
2. Copy `config/config.example.js` to `config/config.js` and add your YNAB API credentials
3. Build the Docker image: `docker build -t ynab-mcp:latest .`
4. Create a JSON configuration for Claude:
   ```json
   {
     "command": "docker",
     "args": [
       "run",
       "--rm",
       "-i",
       "-v",
       "/path/to/data:/app/data",
       "-v",
       "/path/to/config:/app/config",
       "-e",
       "NODE_ENV=production",
       "ynab-mcp:latest"
     ]
   }
   ```
5. Register the MCP with Claude Code CLI:
   ```bash
   claude mcp add-json ynab '{"command": "docker", "args": ["run", "--rm", "-i", "-v", "/path/to/data:/app/data", "-v", "/path/to/config:/app/config", "-e", "NODE_ENV=production", "ynab-mcp:latest"]}'
   ```
   You can also save the JSON to a file and use:
   ```bash
   claude mcp add-json ynab "$(cat config.json)"
   ```
6. Authenticate with your YNAB account when prompted by Claude

## Integration with Claude

This MCP integrates seamlessly with Claude, allowing:
- Viewing budgets and transactions
- Getting financial insights
- Managing your budget through natural conversation

## Security

- Tokens are stored securely in a mounted Docker volume
- No sensitive data is logged
- Authentication uses OAuth 2.0 standards
- Support for read-only mode

## Implementation Details

The implementation follows the Model Context Protocol standard using:
- Node.js and the official MCP SDK
- Docker for containerization and deployment
- YNAB JavaScript SDK for API operations
- OAuth 2.0 for authentication

## License

MIT

## Acknowledgements

- [YNAB API](https://api.youneedabudget.com/)
- [YNAB JavaScript Library](https://github.com/ynab/ynab-sdk-js)
- [Anthropic Claude](https://claude.ai/)