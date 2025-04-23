/**
 * YNAB MCP Test Script
 * Simulates requests from Claude to test the MCP server
 */

const { spawn } = require('child_process');
const path = require('path');

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test MCP requests
async function testMcp(toolName, toolArgs) {
  console.log('Starting YNAB MCP test...');
  
  // Process arguments
  const toolToCall = toolName || 'list_ynab_accounts';
  let parsedArgs = {};
  
  if (toolArgs) {
    try {
      parsedArgs = JSON.parse(toolArgs);
    } catch (e) {
      console.error('Error parsing tool arguments JSON:', e.message);
      process.exit(1);
    }
  }
  
  // Launch the MCP server
  const serverProcess = spawn('node', [path.join(__dirname, 'src', 'server.js')], {
    stdio: ['pipe', 'pipe', 'inherit']
  });
  
  // Connect to the server's stdin/stdout
  const serverStdin = serverProcess.stdin;
  const serverStdout = serverProcess.stdout;
  
  // Setup data buffer for JSON parsing
  let dataBuffer = '';
  
  // Handle server output
  serverStdout.on('data', (chunk) => {
    dataBuffer += chunk.toString();
    
    try {
      // Try to parse as JSON
      const lines = dataBuffer.split('\n');
      
      // Process complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const json = JSON.parse(line);
            console.log('Received JSON response:', JSON.stringify(json, null, 2));
          } catch (err) {
            // Not a valid JSON
            console.log('Server output:', line);
          }
        }
      }
      
      // Keep the last (potentially incomplete) line
      dataBuffer = lines[lines.length - 1];
    } catch (error) {
      // Just collect more data if we can't parse it yet
    }
  });
  
  // Wait for server to initialize
  await wait(2000);
  
  try {
    // Test 1: Initialize request
    console.log('\n[TEST 1] Sending Initialize request...');
    const initializeRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        clientInfo: {
          name: "YNAB MCP Test Client",
          version: "0.1.0"
        },
        capabilities: {
          tools: {
            list: true,
            call: true
          }
        }
      }
    };
    serverStdin.write(JSON.stringify(initializeRequest) + '\n');
    
    // Wait for response
    await wait(1000);
    
    // Test 2: List tools
    console.log('\n[TEST 2] Sending tools/list request...');
    const listToolsRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };
    serverStdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // Wait for response
    await wait(1000);
    
    // Test 3: Call the specified tool with arguments
    console.log(`\n[TEST 3] Sending tools/call request for ${toolToCall}...`);
    console.log(`Arguments: ${JSON.stringify(parsedArgs)}`);
    
    const callToolRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: toolToCall,
        arguments: parsedArgs
      }
    };
    serverStdin.write(JSON.stringify(callToolRequest) + '\n');
    
    // Wait for response
    await wait(3000);
    
    console.log('\nTests completed, shutting down server...');
    serverProcess.kill();
  } catch (error) {
    console.error('Test error:', error);
    serverProcess.kill();
  }
}

// Check for command line arguments
const toolName = process.argv[2];
const toolArgs = process.argv[3];

// Run the tests
testMcp(toolName, toolArgs).catch(console.error);