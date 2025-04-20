# YNAB MCP Project Resume Guide

## Project Status

**Completed**:
- ✅ High-Level Design (approved)
- ✅ Low-Level Design (PR #6 merged)
- ✅ Core infrastructure (authentication, token management)
- ✅ All API implementations:
  - ✅ Budget operations
  - ✅ Account operations
  - ✅ Category operations
  - ✅ Transaction operations
  - ✅ Payee operations
  - ✅ Month operations
- ✅ Documentation (API reference, setup guides)

**Next Steps**:
1. Build Docker image and test deployment
2. Implement testing framework
3. Implement caching for performance
4. Add reporting/insight features (Phase 3)
5. Create specialty views for Mel's finances

## Key Files

- **Core Server**: `src/server.js`
- **MCP Handler**: `src/mcp/handler.js`
- **API Implementations**:
  - `src/api/budgets.js`
  - `src/api/accounts.js`
  - `src/api/categories.js`
  - `src/api/transactions.js`
  - `src/api/payees.js`
  - `src/api/months.js`
- **Auth Implementation**: 
  - `src/auth/oauth.js`
  - `src/auth/tokenManager.js`
- **Utilities**:
  - `src/utils/rateLimit.js` (200 req/hour limit)
  - `src/utils/errorHandler.js`
  - `src/utils/logger.js`
  - `src/utils/urlShortener.js`
- **Documentation**:
  - `docs/API.md`
  - `docs/SETUP.md`
  - `docs/CLAUDE_SETUP.md`

## GitHub Repository

Repository: https://github.com/mattweg/ynab-mcp

## OAuth Credentials

- Client ID: `qZBgoP92_BeEyHj0hsekr66-4zgcnz8Rww1w86QIEOY`
- Client Secret: `xAVgg4QeYBk3SXwFePEMqyi3TpFiLTvcMuDq00mLfPA`
- Redirect URI: `urn:ietf:wg:oauth:2.0:oob`

## Quick Start Instructions

1. **Build the Docker image**:
```bash
cd ~/ynab-mcp
docker build -t ynab-mcp-server .
```

2. **Create config directories**:
```bash
mkdir -p ~/.mcp/ynab-mcp/data
```

3. **Configure Claude/Emma**:
```bash
emma mcp add-json ynab '{
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
}'
```

4. **Test connection**:
```bash
emma --print --mcp-debug "Do you have access to YNAB tools?"
```

## To-Do Items for Next Session

1. Implement unit tests for API modules
2. Create data caching mechanism for frequently accessed data
3. Add reporting features for budget insights
4. Implement multi-budget support for Mel's finances
5. Create custom workflows for common tasks

## Useful Docker Commands

```bash
# View logs
docker logs -f $(docker ps -q --filter ancestor=ynab-mcp-server:latest)

# Restart container
docker restart $(docker ps -q --filter ancestor=ynab-mcp-server:latest)

# Check container status
docker ps | grep ynab-mcp-server
```

## Implementation Notes

- All monetary values use "milliunits" (thousandths of currency unit)
- Authentication uses OAuth 2.0 with OOB flow
- Rate limiting is set to 200 requests per hour per YNAB limits
- The official YNAB JavaScript SDK is used for all API operations
- All API methods include detailed error handling and validation

## Common Testing Workflows

```
# Authentication
Ask Claude/Emma: "Connect to my YNAB account"

# Budget overview
Ask Claude/Emma: "Show me my budget summary"

# Transaction creation
Ask Claude/Emma: "Add a new transaction for $15 at Starbucks yesterday"

# Category adjustments
Ask Claude/Emma: "Update my grocery budget to $500 for this month"
```

---

*Project Status as of: April 20, 2025*