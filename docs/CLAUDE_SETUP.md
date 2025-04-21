# Setting Up YNAB MCP with Claude Code

This document explains how to integrate the YNAB MCP server with Claude Code or Emma CLI.

## Method 1: Direct Docker Container (Matt's Preference)

Matt prefers working directly with Docker containers over wrapper scripts. To start the YNAB MCP server:

```bash
# Stop any existing containers (if needed)
docker stop ynab-mcp-container || true

# Start a new container with correct volume mappings
docker run -d --name ynab-mcp-container \
  -v /home/claude-user/.mcp/ynab-mcp:/app/data \
  -v /home/claude-user/ynab-mcp/config:/app/config \
  -e NODE_ENV=production \
  ynab-mcp:latest
```

### Key Configuration Requirements:

1. **Config file**: Ensure `/home/claude-user/ynab-mcp/config/config.js` exists with:
   - OAuth credentials (clientId and clientSecret)
   - Token path pointing to `/app/config/tokens.json`
   - Proper cache settings

2. **Troubleshooting**:
   - If experiencing "Connection closed" errors, check container logs with `docker logs ynab-mcp-container`
   - Volume mappings are critical for both config and data directories

## Method 2: Using `mcp add-json` Command

Alternatively, the MCP server can be added using the `mcp add-json` command:

```bash
emma mcp add-json ynab '{
  "command": "docker",
  "args": [
    "run",
    "--rm",
    "-i",
    "-v", "/home/claude-user/.mcp/ynab-mcp:/app/config",
    "-v", "/home/claude-user/.mcp/ynab-mcp/data:/app/data",
    "-e", "YNAB_CLIENT_ID=524cfd7c70904f208b9daed6ea8fcc56be3464fec12ec07c22350caa7b45c30b",
    "-e", "YNAB_CLIENT_SECRET=c89ec70b63a16c8aeddbe1e582029b4ccb04cbc5a30da40da6d1acca19c9be1a",
    "-e", "YNAB_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob",
    "-e", "LOG_LEVEL=info",
    "ynab-mcp:latest"
  ]
}'
```

This command configures the MCP server with all the necessary parameters in a single command.

## Method 2: Using Configuration File

You can also add the MCP server to your Claude configuration file:

1. Edit the configuration file:
```bash
nano ~/.claude.json  # or appropriate path for your environment
```

2. Add the YNAB MCP configuration in the `mcpServers` section:
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

## Testing the Setup

After setting up the MCP, you can test it using the `--print` and `--mcp-debug` flags:

```bash
emma --print --mcp-debug "Do you have access to YNAB tools?"
```

This command will run in non-interactive mode and show debug information about the MCP communication.

You can also verify the setup by listing the configured MCP servers:

```bash
emma mcp list
```

This should show the `ynab` MCP server in the list of configured servers.

## Using the MCP

Once configured, you can start using the YNAB MCP in your conversations with Claude or Emma:

1. Start a conversation:
```bash
emma
```

2. Ask to connect to your YNAB account:
```
Can you connect to my YNAB account?
```

3. Follow the authentication flow as guided by Claude/Emma.

## Troubleshooting

If you encounter issues with the MCP configuration:

1. Check if the MCP is properly registered:
```bash
emma mcp list
```

2. Test the MCP with debug output:
```bash
emma --mcp-debug --print "Check if YNAB MCP is working"
```

3. Verify the Docker image exists:
```bash
docker images | grep ynab-mcp-server
```

4. Check for Docker volume permissions:
```bash
ls -la ~/.mcp/ynab-mcp
```

5. Try removing and re-adding the MCP server:
```bash
emma mcp remove ynab
emma mcp add-json ynab '{ ... configuration ... }'
```