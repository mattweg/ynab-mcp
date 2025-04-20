# Implement MCP SDK Integration for YNAB Server

## Overview

This PR implements a complete integration of the YNAB MCP server with the official Model Context Protocol SDK. It replaces the custom implementation with a standards-compliant approach that properly communicates with Claude via the StdioServerTransport.

## Key Changes

- Added the official `@modelcontextprotocol/sdk` package
- Refactored `server.js` to use the MCP SDK and StdioServerTransport
- Created comprehensive tool definitions for all YNAB operations
- Added Docker configuration and a wrapper script for Claude integration
- Created detailed documentation and test plans
- Set up proper token storage in the Docker environment

## Implementation Details

The implementation follows the same pattern as the Google Workspace MCP:

1. **Server Implementation**: Uses the official SDK to handle MCP protocol communication
2. **StdioServerTransport**: Communicates directly with Claude via stdin/stdout
3. **Tool Definitions**: Well-structured tool definitions with clear schemas
4. **Docker Integration**: Containerized for easy deployment with proper volume mounts

## Testing Performed

- Standalone testing with test-mcp.js that simulates Claude's requests
- Verified proper server initialization and tool responses
- Tested Docker build and container execution
- Validated wrapper script functionality

## Documentation

Added several new documentation files:
- `IMPLEMENTATION.md` - Detailed implementation notes
- `TEST_PLAN.md` - Plan for testing with Claude
- `MCP_README.md` - MCP implementation overview
- `CLAUDE_USAGE.md` - Guide for using YNAB with Claude
- `NEXT_STEPS.md` - Remaining tasks and improvements
- `SUMMARY.md` - Summary of implementation work

## How to Test

1. Clone the PR branch
2. Execute the wrapper script: `./wrapper.sh`
3. Test with Claude by initiating conversations about YNAB

## Next Steps After Merge

- Perform comprehensive end-to-end testing with Claude
- Add advanced analytics features
- Implement caching for better performance
- Create custom views for specific use cases