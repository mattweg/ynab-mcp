FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create config directory
RUN mkdir -p /app/config
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port for MCP communication
EXPOSE 8080

# Start application
CMD ["node", "src/server.js"]