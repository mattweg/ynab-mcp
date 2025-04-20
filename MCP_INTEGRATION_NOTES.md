# YNAB MCP Integration Notes

## Current Status & Findings

We've successfully implemented:
- YNAB OAuth authentication flow (validated and working)
- Core API functionality (budgets, accounts, categories, transactions)
- Persistent token storage and management

The issue preventing successful integration with Emma/Claude is the MCP communication protocol implementation.

## Root Cause Analysis

After comparing our implementation with the successful Google Workspace MCP:

1. **Protocol Mismatch**: Our custom implementation doesn't fully match what Emma/Claude expects
   - We've tried both HTTP server and direct stdin/stdout approaches
   - Direct testing works, but Emma/Claude connections timeout

2. **Key Missing Component**: We're not using the official MCP SDK
   - Google Workspace uses `@modelcontextprotocol/sdk`
   - Specifically, they use `StdioServerTransport` for communication

## Recommended Solution

Implement the official MCP SDK:

1. Add dependency:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. Refactor server.js to use the SDK:
   ```javascript
   import { Server } from "@modelcontextprotocol/sdk/server/index.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
   
   // Create server instance
   const server = new Server(
     {
       name: "YNAB MCP Server",
       version: "0.1.0"
     },
     {
       capabilities: {
         tools: {
           list: true,
           call: true
         }
       }
     }
   );
   
   // Set up tool handlers
   server.setRequestHandler(ListToolsRequestSchema, async () => {
     // Return tool definitions
   });
   
   server.setRequestHandler(CallToolRequestSchema, async (request) => {
     // Handle tool calls by mapping to our existing functions
   });
   
   // Connect transport
   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

3. Convert our handler.js functions to the SDK's expected format

## Testing Progress

We've validated that:
- Direct API calls work perfectly
- Authentication flow works end-to-end
- Docker container builds and runs successfully
- The wrapper script works when called directly

The ONLY remaining issue is proper MCP protocol communication with Emma/Claude.

## Next Steps

1. Implement the official MCP SDK
2. Refactor server.js to use StdioServerTransport
3. Map existing functionality to SDK's request/response format
4. Test with Emma/Claude to validate
5. Proceed with implementing remaining features (caching, testing framework, etc.)

By implementing the SDK, we'll benefit from its standard implementation of the protocol that works with Claude Code's expectations.