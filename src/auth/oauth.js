/**
 * OAuth Implementation for YNAB MCP
 * Handles authentication flow with YNAB API
 */

const axios = require('axios');
const { logger } = require('../utils/logger');
const { shortenUrl } = require('../utils/urlShortener');
const { tokenManager } = require('./tokenManager');
const { AuthenticationError } = require('../utils/errorHandler');
const config = require('../../config/config');

/**
 * Generate authorization URL for OAuth flow
 * @returns {Promise<object>} Object containing both original and shortened auth URLs
 */
async function generateAuthUrl() {
  const { clientId, redirectUri } = config.oauth;
  
  // Build YNAB authorization URL
  const authUrl = `https://app.youneedabudget.com/oauth/authorize?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;
  
  // Try to create a short URL for better terminal experience
  const shortUrl = await shortenUrl(authUrl);
  
  return {
    auth_url: authUrl,
    short_url: shortUrl
  };
}

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code from OAuth flow
 * @returns {Promise<object>} Token data
 */
async function exchangeCodeForToken(code) {
  try {
    const tokenUrl = 'https://app.youneedabudget.com/oauth/token';
    const { clientId, clientSecret, redirectUri } = config.oauth;
    
    const response = await axios.post(tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code: code
    });
    
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in || 7200 // Default to 2 hours if not provided
    };
  } catch (error) {
    logger.error('Error exchanging code for token:', error);
    
    // Provide more detailed error messages based on the response
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data || {};
      
      if (status === 400) {
        throw new AuthenticationError(
          data.error_description || 'Invalid authorization code',
          'INVALID_AUTH_CODE'
        );
      } else if (status === 401) {
        throw new AuthenticationError(
          'OAuth client authentication failed',
          'CLIENT_AUTH_FAILED'
        );
      }
    }
    
    throw new AuthenticationError('Failed to complete authentication');
  }
}

/**
 * Complete the OAuth flow by saving the tokens
 * @param {string} email - Account identifier
 * @param {string} code - Authorization code
 * @returns {Promise<object>} Success status
 */
async function completeAuthentication(email, code) {
  try {
    // Exchange the code for tokens
    const tokenData = await exchangeCodeForToken(code);
    
    // Save the tokens
    tokenManager.setToken(email, tokenData);
    
    return {
      status: 'success',
      message: 'Authentication completed successfully',
      email,
      authenticated: true
    };
  } catch (error) {
    logger.error('Authentication completion failed:', error);
    throw error;
  }
}

/**
 * Start the authentication process
 * @param {string} email - Account identifier
 * @returns {Promise<object>} URLs for authentication
 */
async function startAuthentication(email) {
  try {
    const urls = await generateAuthUrl();
    
    return {
      status: 'auth_required',
      message: 'Authentication required',
      auth_url: urls.auth_url,
      short_url: urls.short_url,
      email
    };
  } catch (error) {
    logger.error('Failed to start authentication:', error);
    throw new AuthenticationError('Failed to start authentication process');
  }
}

/**
 * Remove authentication for an account
 * @param {string} email - Account identifier
 * @returns {object} Success status
 */
function removeAuthentication(email) {
  const removed = tokenManager.removeToken(email);
  
  if (removed) {
    return {
      status: 'success',
      message: `Authentication removed for ${email}`
    };
  }
  
  return {
    status: 'not_found',
    message: `No authentication found for ${email}`
  };
}

/**
 * List all authenticated accounts
 * @returns {Array} List of account objects
 */
function listAuthenticatedAccounts() {
  return tokenManager.listAccounts();
}

module.exports = {
  generateAuthUrl,
  exchangeCodeForToken,
  completeAuthentication,
  startAuthentication,
  removeAuthentication,
  listAuthenticatedAccounts
};