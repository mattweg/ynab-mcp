# Add Enhanced Category Management Features

## Summary

This PR adds two powerful new features to the YNAB MCP:

1. `assign_to_categories`: Allocate funds from Ready to Assign to multiple categories in a single operation
2. `get_recommended_allocations`: Get AI-powered recommendations for budget distribution based on goals and spending patterns

## Implementation Details

- Added two new functions to the categories API
- Extended the MCP handler and schema to expose these functions
- Added comprehensive documentation
- Created a test script to verify functionality

## Benefits

- **Time Savings**: Reduce time spent on routine budget management tasks
- **Consistency**: Apply consistent budgeting patterns across categories
- **Intelligence**: Leverage AI-powered recommendations based on spending patterns
- **Automation**: Simplify the process of funding multiple categories at once

## Testing

- Verified API functions in the test environment
- Checked Docker build and functionality
- Tested recommendation engine with various budget scenarios

## Documentation

Full documentation provided in:
- README.md updates
- New file: docs/category-management.md with detailed usage instructions

## Future Enhancements

Potential future enhancements could include:
- Saving and loading budget templates
- Additional recommendation strategies
- Seasonal budget adjustments
- Integration with transaction patterns