# Setup Guide

This document provides detailed instructions for setting up the YNAB MCP server with Claude Code.

## YNAB Developer Account Setup

1. A YNAB account with API access is required
2. OAuth credentials have been created for this application
3. The application uses Out-of-Band (OOB) authentication flow

## Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t ynab-mcp-server .
   ```

2. Create configuration directories:
   ```bash
   mkdir -p ~/.mcp/ynab-mcp/data
   ```

## Claude Code Configuration

Add the following configuration to your Claude Code setup:

```json
{
  "mcpServers": {
    "ynab": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-v", "/home/claude-user/.mcp/ynab-mcp:/app/config",
        "-v", "/home/claude-user/.mcp/ynab-mcp/data:/app/data",
        "-e", "YNAB_CLIENT_ID",
        "-e", "YNAB_CLIENT_SECRET",
        "-e", "YNAB_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob",
        "-e", "LOG_LEVEL=info",
        "ynab-mcp-server:latest"
      ],
      "env": {
        "YNAB_CLIENT_ID": "your-client-id",
        "YNAB_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Replace `your-client-id` and `your-client-secret` with your actual YNAB OAuth credentials.

## Authentication Process

1. Start a conversation with Claude Code
2. Ask Claude to connect to your YNAB account
3. Claude will provide a URL to open in your browser
4. Complete the authentication in your browser
5. Copy the authorization code provided by YNAB
6. Paste the code back to Claude
7. Claude will confirm successful authentication

## Testing the Integration

Try these example commands to test the integration:

- "List my YNAB budgets"
- "Show my account balances"
- "How much is left in my grocery budget this month?"
- "Show my recent transactions"

## Troubleshooting

- If authentication fails, try removing the account and re-authenticating
- Check Docker logs for detailed error messages
- Ensure your YNAB account has API access enabled