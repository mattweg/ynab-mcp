/**
 * Unit tests for OAuth functionality
 */

const { startAuthentication, removeAuthentication } = require('../../src/auth/oauth');
const { tokenManager } = require('../../src/auth/tokenManager');
const { shortenUrl } = require('../../src/utils/urlShortener');

// Mock the dependencies
jest.mock('../../src/auth/tokenManager', () => ({
  tokenManager: {
    removeToken: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  }
}));

jest.mock('../../src/utils/urlShortener', () => ({
  shortenUrl: jest.fn()
}));

describe('OAuth functionality', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('startAuthentication', () => {
    it('should generate auth URLs and return them', async () => {
      // Mock the shortenUrl function
      shortenUrl.mockResolvedValue('https://short.url/abc123');
      
      // Call the function
      const result = await startAuthentication('test@example.com');
      
      // Check the result
      expect(result).toHaveProperty('status', 'auth_required');
      expect(result).toHaveProperty('auth_url');
      expect(result).toHaveProperty('short_url', 'https://short.url/abc123');
      expect(result).toHaveProperty('email', 'test@example.com');
      
      // Verify shortenUrl was called
      expect(shortenUrl).toHaveBeenCalled();
    });
  });
  
  describe('removeAuthentication', () => {
    it('should remove token and return success when token exists', () => {
      // Mock the tokenManager
      tokenManager.removeToken.mockReturnValue(true);
      
      // Call the function
      const result = removeAuthentication('test@example.com');
      
      // Check the result
      expect(result).toHaveProperty('status', 'success');
      
      // Verify removeToken was called with the correct email
      expect(tokenManager.removeToken).toHaveBeenCalledWith('test@example.com');
    });
    
    it('should return not_found when token does not exist', () => {
      // Mock the tokenManager
      tokenManager.removeToken.mockReturnValue(false);
      
      // Call the function
      const result = removeAuthentication('test@example.com');
      
      // Check the result
      expect(result).toHaveProperty('status', 'not_found');
      
      // Verify removeToken was called with the correct email
      expect(tokenManager.removeToken).toHaveBeenCalledWith('test@example.com');
    });
  });
});