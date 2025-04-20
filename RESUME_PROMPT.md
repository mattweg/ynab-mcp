# YNAB MCP Project Resumption Prompt

Continue work on the YNAB MCP (Model Context Protocol) server integration. We've identified that we need to implement the official MCP SDK to properly communicate with Emma/Claude.

## Current Status

1. We have a fully working YNAB API implementation:
   - OAuth 2.0 authentication flow
   - Budget, account, transaction operations
   - Token storage and refresh
   - All functional when tested directly

2. We've identified the communication issue:
   - Our custom MCP implementation doesn't match what Emma/Claude expects
   - We need to use the official `@modelcontextprotocol/sdk` package
   - Specifically, we need to use the `StdioServerTransport` for communication

## Next Steps

1. Install the MCP SDK:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. Refactor server.js to use the SDK:
   - Create a Server instance with metadata and capabilities
   - Set up ListToolsRequestSchema handler to return our tool definitions
   - Set up CallToolRequestSchema handler to map to our existing functions
   - Connect the StdioServerTransport for stdin/stdout communication

3. Test with Emma/Claude to verify it works correctly

4. Continue implementing the remaining project items:
   - Testing framework
   - Caching for performance
   - Reporting features
   - Custom views for Mel's finances

## Available Resources

- Examine `/home/claude-user/ynab-mcp/MCP_INTEGRATION_NOTES.md` for detailed analysis
- Reference `/home/claude-user/google-workspace-mcp/src/tools/server.ts` for a working example of the MCP SDK implementation
- Our existing implementation is in `/home/claude-user/ynab-mcp/src/server.js` and `/home/claude-user/ynab-mcp/src/mcp/handler.js`
- YNAB authentication tokens are already set up for `mattweg@gmail.com`

Please help implement the MCP SDK integration for our YNAB server and ensure it works properly with Emma/Claude.