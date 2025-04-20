# Getting Started with YNAB MCP

This guide will walk you through setting up and using the YNAB MCP server with Claude Code.

## Prerequisites

- Node.js 18+ (for development)
- Docker (for deployment)
- Claude Code CLI
- YNAB account

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/mattweg/ynab-mcp.git
cd ynab-mcp
```

### 2. Configure the Server

1. Create a configuration file by copying the example:

```bash
cp config-example.js config.js
```

2. Verify the OAuth credentials in `config.js`:

```javascript
oauth: {
  clientId: "qZBgoP92_BeEyHj0hsekr66-4zgcnz8Rww1w86QIEOY",
  clientSecret: "xAVgg4QeYBk3SXwFePEMqyi3TpFiLTvcMuDq00mLfPA",
  redirectUri: "urn:ietf:wg:oauth:2.0:oob"
}
```

### 3. Build the Docker Image

```bash
docker build -t ynab-mcp-server .
```

### 4. Create Storage Directories

```bash
mkdir -p ~/.mcp/ynab-mcp/data
```

### 5. Configure Claude Code

Add the following to your Claude configuration:

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
        "-e", "YNAB_CLIENT_ID=qZBgoP92_BeEyHj0hsekr66-4zgcnz8Rww1w86QIEOY",
        "-e", "YNAB_CLIENT_SECRET=xAVgg4QeYBk3SXwFePEMqyi3TpFiLTvcMuDq00mLfPA",
        "-e", "YNAB_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob",
        "-e", "LOG_LEVEL=info",
        "ynab-mcp-server:latest"
      ]
    }
  }
}
```

## Using the MCP with Claude Code

### Authentication Flow

1. Start a conversation with Claude Code
2. Ask Claude to connect to your YNAB account:

```
Can you connect to my YNAB account?
```

3. Claude will provide a URL to open in your browser
4. Complete the authentication in your browser
5. Copy the authorization code provided by YNAB
6. Paste the code back to Claude
7. Claude will confirm successful authentication

### Example Commands

Try these natural language queries with Claude:

```
List my YNAB budgets
```

```
Show me my account balances
```

```
How much is left in my grocery budget this month?
```

```
Show me my recent transactions
```

```
Add a new transaction for $15 at Starbucks yesterday
```

```
Help me analyze my spending in February
```

## Troubleshooting

### Authentication Issues

If you encounter authentication problems:

1. Ask Claude to remove your account:
```
Remove my YNAB account
```

2. Then re-authenticate:
```
Connect to my YNAB account
```

### Rate Limiting

YNAB API has a limit of 200 requests per hour. The MCP server manages this limit automatically, but if you encounter rate limit errors, wait for the limit to reset.

## Development and Testing

### Running Tests

```bash
npm test
```

### Local Development

```bash
npm run dev
```

This starts the server in development mode with auto-reloading.

## Next Steps

- Complete the implementation of all API endpoints
- Add more comprehensive error handling
- Implement caching for frequently accessed data
- Develop reporting and analysis features