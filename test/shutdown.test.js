/**
 * Test for graceful shutdown handling
 * 
 * This test verifies that the server correctly handles
 * termination signals and shuts down gracefully.
 */

const { spawn } = require('child_process');
const path = require('path');

describe('Server Shutdown', () => {
  test('should handle SIGTERM signal and exit with code 0', (done) => {
    // Set a longer timeout since we're testing shutdown behavior
    jest.setTimeout(10000);
    
    // Start the server in a child process
    const serverProcess = spawn('node', [path.join(__dirname, '../src/server.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });
    
    let output = '';
    
    // Collect stdout
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      
      // When we see the server is running, send the termination signal
      if (output.includes('YNAB MCP server running')) {
        // Give the server a moment to fully initialize
        setTimeout(() => {
          // Send SIGTERM signal
          serverProcess.kill('SIGTERM');
        }, 1000);
      }
    });
    
    // Handle process exit
    serverProcess.on('exit', (code) => {
      try {
        // Verify output contains shutdown messages
        expect(output).toContain('Signal handlers registered for graceful shutdown');
        expect(output).toContain('Received shutdown signal');
        expect(output).toContain('YNAB MCP server shutdown complete');
        
        // Verify exit code is 0 (success)
        expect(code).toBe(0);
        done();
      } catch (error) {
        done(error);
      }
    });
    
    // Handle test timeout or errors
    serverProcess.on('error', (error) => {
      done(error);
    });
  });
});