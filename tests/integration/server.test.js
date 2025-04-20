/**
 * Integration tests for the server
 */

const request = require('supertest');
const app = require('../../src/server');

describe('Server integration tests', () => {
  describe('Health endpoint', () => {
    it('should return a 200 status and ok message', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });
  
  describe('MCP endpoint', () => {
    it('should handle invalid requests properly', async () => {
      const response = await request(app)
        .post('/')
        .send({});
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
    
    it('should validate function name', async () => {
      const response = await request(app)
        .post('/')
        .send({ parameters: {} });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toMatch(/function.*required/i);
    });
    
    it('should reject invalid function names', async () => {
      const response = await request(app)
        .post('/')
        .send({ function: 'invalid_function', parameters: {} });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toMatch(/unsupported function/i);
    });
  });
});