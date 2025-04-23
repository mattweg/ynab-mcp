/**
 * Debug script for YNAB transactions API
 */

const { API } = require('ynab');
const fs = require('fs');

async function debugTransactions() {
  try {
    // Load the token from tokens.json
    const tokensFile = fs.readFileSync('./config/tokens.json', 'utf8');
    const tokens = JSON.parse(tokensFile);
    
    // Get Matt's token
    const userToken = tokens['mattweg@gmail.com'];
    if (!userToken) {
      console.error('No token found for mattweg@gmail.com');
      return;
    }
    
    // Create YNAB API instance
    const accessToken = userToken.access_token;
    const ynabAPI = new API(accessToken);
    
    // Set budget ID
    const budgetId = 'fd559269-1415-456f-afda-f1e5b5c35508';
    
    console.log('Testing transactions API with different date formats...');
    
    // Test with no date filter
    try {
      console.log('\nTest 1: No date filter');
      const response1 = await ynabAPI.transactions.getTransactions(budgetId);
      console.log('Success! Received', response1.data.transactions.length, 'transactions');
    } catch (err) {
      console.error('Error with no date filter:', err.error);
    }
    
    // Test with date string in ISO format
    try {
      console.log('\nTest 2: ISO date string "2025-04-01"');
      const response2 = await ynabAPI.transactions.getTransactions(budgetId, '2025-04-01');
      console.log('Success! Received', response2.data.transactions.length, 'transactions');
    } catch (err) {
      console.error('Error with ISO date string:', err.error);
    }
    
    // Test with Date object
    try {
      console.log('\nTest 3: Date object new Date("2025-04-01")');
      const response3 = await ynabAPI.transactions.getTransactions(budgetId, new Date('2025-04-01'));
      console.log('Success! Received', response3.data.transactions.length, 'transactions');
    } catch (err) {
      console.error('Error with Date object:', err.error);
    }
    
    // Test with MM/DD/YYYY format
    try {
      console.log('\nTest 4: US date format "04/01/2025"');
      const response4 = await ynabAPI.transactions.getTransactions(budgetId, '04/01/2025');
      console.log('Success! Received', response4.data.transactions.length, 'transactions');
    } catch (err) {
      console.error('Error with US date format:', err.error);
    }
    
    // Test with limit
    try {
      console.log('\nTest 5: With limit of 5');
      // Note: YNAB API doesn't have a limit parameter, so we'll need to slice results
      const response5 = await ynabAPI.transactions.getTransactions(budgetId);
      const limitedTransactions = response5.data.transactions.slice(0, 5);
      console.log('Success! Received', limitedTransactions.length, 'transactions (limited from', response5.data.transactions.length, ')');
    } catch (err) {
      console.error('Error with limit:', err.error);
    }
    
  } catch (err) {
    console.error('General error:', err);
  }
}

// Run the debug function
debugTransactions();