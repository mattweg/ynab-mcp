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
2. Build the Docker image
3. Configure Claude Code to use the MCP server
4. Authenticate with your YNAB account

Detailed setup instructions are available in the [documentation](docs/SETUP.md).

## Security

- Tokens are stored securely in a mounted Docker volume
- No sensitive data is logged
- Authentication uses OAuth 2.0 standards
- Support for read-only mode

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Privacy Policy](https://mattweg.github.io/ynab-mcp/privacy-policy)

## License

MIT

## Acknowledgements

- [YNAB API](https://api.youneedabudget.com/)
- [YNAB JavaScript Library](https://github.com/ynab/ynab-sdk-js)
- [Anthropic Claude](https://claude.ai/)