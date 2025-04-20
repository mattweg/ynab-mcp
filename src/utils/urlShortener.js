/**
 * URL Shortener utility for YNAB MCP
 * Shortens OAuth URLs for better terminal display
 */

const { execSync } = require('child_process');
const { logger } = require('./logger');

/**
 * Shortens a URL using the available URL shortener script
 * Falls back to the original URL if shortening fails
 * 
 * @param {string} longUrl - The URL to shorten
 * @returns {Promise<string>} - The shortened URL or original if shortening fails
 */
async function shortenUrl(longUrl) {
  try {
    // Use existing URL shortener script
    const shortUrl = execSync(`node /home/claude-user/shorten_url.js "${longUrl}"`).toString().trim();
    logger.info(`URL shortened: ${longUrl.substring(0, 30)}... -> ${shortUrl}`);
    return shortUrl;
  } catch (error) {
    logger.warn('Failed to shorten URL', error);
    
    // Try alternate shortener if available
    try {
      // Try Python version if available
      const shortUrl = execSync(`python3 /home/claude-user/shorten_url.py "${longUrl}"`).toString().trim();
      logger.info(`URL shortened with Python: ${longUrl.substring(0, 30)}... -> ${shortUrl}`);
      return shortUrl;
    } catch (pythonError) {
      logger.warn('Failed to shorten URL with Python fallback', pythonError);
      return longUrl; // Return original URL if shortening fails
    }
  }
}

module.exports = { shortenUrl };