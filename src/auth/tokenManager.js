/**
 * Token Manager for YNAB MCP
 * Handles storage, retrieval, and refresh of OAuth tokens
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { TokenError } = require('../utils/errorHandler');
const config = require('../../config-example');

class TokenManager {
  constructor(options = {}) {
    this.configPath = options.configPath || path.join(process.cwd(), 'config', 'tokens.json');
    this.tokens = {};
    this.encryptionEnabled = options.encryptionEnabled || config.tokenStore.encrypt || false;
    
    // Create directory if it doesn't exist
    const dir = path.dirname(this.configPath);
    fs.ensureDirSync(dir);
    
    this.loadTokens();
  }
  
  /**
   * Load tokens from storage
   */
  loadTokens() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.tokens = JSON.parse(data);
        logger.info('Tokens loaded successfully');
      } else {
        logger.info('No tokens file found, starting with empty tokens');
      }
    } catch (error) {
      logger.error('Failed to load tokens', error);
      this.tokens = {};
    }
  }
  
  /**
   * Save tokens to persistent storage
   */
  saveTokens() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.tokens, null, 2));
      logger.info('Tokens saved successfully');
    } catch (error) {
      logger.error('Failed to save tokens', error);
      throw new TokenError('Failed to save authentication data');
    }
  }
  
  /**
   * Get token for a specific account
   * @param {string} email - Account identifier
   * @returns {object|null} - Token data or null if not found
   */
  getToken(email) {
    return this.tokens[email];
  }
  
  /**
   * Set token for a specific account
   * @param {string} email - Account identifier
   * @param {object} tokenData - Token data including access_token, refresh_token, etc.
   */
  setToken(email, tokenData) {
    this.tokens[email] = {
      ...tokenData,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    };
    this.saveTokens();
  }
  
  /**
   * Check if token exists for an account
   * @param {string} email - Account identifier
   * @returns {boolean} - True if token exists
   */
  hasToken(email) {
    return !!this.tokens[email];
  }
  
  /**
   * Remove token for an account
   * @param {string} email - Account identifier
   */
  removeToken(email) {
    if (this.tokens[email]) {
      delete this.tokens[email];
      this.saveTokens();
      logger.info(`Token removed for ${email}`);
      return true;
    }
    return false;
  }
  
  /**
   * List all configured accounts
   * @returns {Array} - Array of account objects with authentication status
   */
  listAccounts() {
    return Object.keys(this.tokens).map(email => {
      const token = this.tokens[email];
      const isExpired = token.expires_at < Date.now();
      
      return {
        email,
        authenticated: true,
        hasRefreshToken: !!token.refresh_token,
        isExpired,
        expiresAt: new Date(token.expires_at).toISOString()
      };
    });
  }
  
  /**
   * Get fresh access token for an account, refreshing if needed
   * @param {string} email - Account identifier
   * @returns {Promise<string>} - Fresh access token
   */
  async getFreshAccessToken(email) {
    const token = this.getToken(email);
    
    if (!token) {
      throw new TokenError(`No token found for account: ${email}`);
    }
    
    // Check if token is about to expire (within 5 minutes)
    if (token.expires_at - Date.now() < 300000) {
      logger.info(`Token for ${email} is expiring soon, refreshing`);
      const refreshedToken = await this.refreshToken(email, token.refresh_token);
      return refreshedToken.access_token;
    }
    
    return token.access_token;
  }
  
  /**
   * Refresh an expired token
   * @param {string} email - Account identifier
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<object>} - New token data
   */
  async refreshToken(email, refreshToken) {
    try {
      const tokenUrl = 'https://app.youneedabudget.com/oauth/token';
      
      const response = await axios.post(tokenUrl, {
        client_id: config.oauth.clientId,
        client_secret: config.oauth.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });
      
      const tokenData = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token || refreshToken, // Use new refresh token if provided
        token_type: response.data.token_type,
        expires_in: response.data.expires_in
      };
      
      this.setToken(email, tokenData);
      logger.info(`Token refreshed successfully for ${email}`);
      
      return tokenData;
    } catch (error) {
      logger.error(`Token refresh failed for ${email}`, error);
      
      // Remove invalid token
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        this.removeToken(email);
      }
      
      throw new TokenError('Failed to refresh token, authentication required');
    }
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

module.exports = { TokenManager, tokenManager };