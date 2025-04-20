// Copy this file to config.js and update values as needed
module.exports = {
  // YNAB OAuth credentials
  oauth: {
    clientId: "qZBgoP92_BeEyHj0hsekr66-4zgcnz8Rww1w86QIEOY",
    clientSecret: "xAVgg4QeYBk3SXwFePEMqyi3TpFiLTvcMuDq00mLfPA",
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
    path: process.env.TOKEN_STORE_PATH || "/app/config/tokens.json",
    encrypt: true
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