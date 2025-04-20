#!/bin/bash

# YNAB MCP Wrapper Script
# This script connects Claude to the YNAB MCP server using the same pattern as Google Workspace MCP

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set Docker image name
IMAGE_NAME="ynab-mcp:latest"

# Build the Docker image if needed
if ! docker images | grep -q "$IMAGE_NAME"; then
  echo "Building Docker image..."
  docker build -t "$IMAGE_NAME" "$SCRIPT_DIR"
fi

# Create data directory for persistent storage if it doesn't exist
mkdir -p "$SCRIPT_DIR/data"

# Run the container with stdin/stdout directly connected
# This follows the pattern used by Google Workspace MCP
docker run --rm -i \
  -v "$SCRIPT_DIR/config:/app/config" \
  -v "$SCRIPT_DIR/data:/app/data" \
  -e NODE_ENV=production \
  "$IMAGE_NAME"