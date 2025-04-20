FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create config and data directories
RUN mkdir -p /app/config
RUN mkdir -p /app/data

# No need for the sed commands anymore since we've updated the imports directly in the code

# Set environment variables
ENV NODE_ENV=production
# No need for PORT since we're using stdin/stdout for MCP communications

# Volume for persistent token storage
VOLUME ["/app/data"]

# Start application with StdioServerTransport
CMD ["node", "src/server.js"]