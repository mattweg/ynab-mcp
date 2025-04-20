# YNAB MCP

YNAB Model Context Protocol (MCP) server for Claude Code integration with You Need A Budget (YNAB).

## Overview

This repository contains a Docker-based MCP server that enables Claude Code to interact with YNAB (You Need A Budget) accounts. It implements the OAuth flow and provides a comprehensive API for budget management, transaction tracking, and financial insights.

## Features

- OAuth-based authentication with YNAB API
- Complete budget and account management
- Transaction creation and categorization
- Support for multiple budgets (personal and family)
- Rate limit handling (YNAB API limit: 200 requests/hour)
- Caching for improved performance

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
4. Configure Claude Code to use the MCP server
5. Authenticate with your YNAB account

## Integration with Claude/Emma

This MCP integrates seamlessly with Claude/Emma, allowing:
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