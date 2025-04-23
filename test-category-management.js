/**
 * Test script for category management features
 */

const { handler } = require('./src/mcp/handler');

async function testCategoryManagement() {
  try {
    // Step 1: Check account authentication
    console.log('Checking YNAB accounts...');
    const accounts = await handler.list_ynab_accounts({});
    console.log('Authenticated accounts:', JSON.stringify(accounts, null, 2));

    if (!accounts.length) {
      console.log('No authenticated accounts found. Run authentication first.');
      return;
    }

    // Step 2: List budgets
    const email = accounts[0].email; // Use the first authenticated account
    console.log(`Using account: ${email}`);
    
    const budgets = await handler.list_budgets({ email });
    console.log('Available budgets:', JSON.stringify(budgets, null, 2));

    if (!budgets.budgets || !budgets.budgets.length) {
      console.log('No budgets found for this account.');
      return;
    }

    const budgetId = budgets.default_budget || budgets.budgets[0].id;
    console.log(`Using budget: ${budgetId}`);

    // Step 3: Get current month to use for testing
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    console.log(`Using month: ${currentMonth}`);

    // Step 4: Test get_recommended_allocations
    console.log('\nTesting get_recommended_allocations...');
    try {
      const recommendations = await handler.get_recommended_allocations({
        email,
        budgetId,
        month: currentMonth
      });
      console.log('Recommended allocations:', JSON.stringify(recommendations, null, 2));
    } catch (error) {
      console.error('Error getting recommended allocations:', error);
    }

    // If you want to test actual allocation, uncomment the following section
    // and add category IDs and amounts from your budget
    /*
    // Step 5: Test assign_to_categories (requires specific category IDs)
    console.log('\nTesting assign_to_categories...');
    try {
      const result = await handler.assign_to_categories({
        email,
        budgetId,
        month: currentMonth,
        categoryAllocations: [
          { categoryId: 'category-id-1', amount: 10 },  // $10
          { categoryId: 'category-id-2', amount: 20 }   // $20
        ]
      });
      console.log('Allocation result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error assigning to categories:', error);
    }
    */

    console.log('\nTests completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCategoryManagement();