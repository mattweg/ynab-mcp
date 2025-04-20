/**
 * YNAB MCP Server
 * Main entry point for the YNAB Model Context Protocol server
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { logger } = require('./utils/logger');
const config = require('../config-example');
const mcpHandler = require('./mcp/handler');

// Initialize Express application
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// MCP endpoint
app.post('/', async (req, res) => {
  try {
    const result = await mcpHandler.handleRequest(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error handling MCP request:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
      status: 'error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || config.server.port || 8080;
app.listen(PORT, () => {
  logger.info(`YNAB MCP server started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; // For testing