// YNAB MCP Configuration
module.exports = {
  // YNAB OAuth credentials
  oauth: {
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    redirectUri: "urn:ietf:wg:oauth:2.0:oob"
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    logLevel: process.env.LOG_LEVEL || "info"
  },
  
  // API rate limiting
  rateLimit: {
    maxRequestsPerHour: 200, // YNAB API limit
    gracefulDegradation: true
  },
  
  // Token storage
  tokenStore: {
    path: "/app/data/tokens.json",
    encrypt: false
  },
  
  // Data cache
  cache: {
    enabled: true,
    ttl: {
      budgets: 3600000, // 1 hour
      accounts: 1800000, // 30 minutes
      categories: 1800000, // 30 minutes
      transactions: 300000 // 5 minutes
    }
  }
};