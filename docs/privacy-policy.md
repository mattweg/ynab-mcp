# Privacy Policy

*Last Updated: April 20, 2025*

## Introduction

This Privacy Policy describes how the YNAB MCP ("we", "our", or "us") collects, uses, and shares your information when you use our integration with You Need A Budget (YNAB).

## Information We Collect

### Account Information
- YNAB OAuth tokens for API access
- Budget IDs and names
- Account identifiers

### Financial Information
- Budget data from your YNAB account
- Account balances
- Transaction details
- Category allocations

## How We Use Your Information

We use your information solely to:
- Authenticate with the YNAB API
- Retrieve and display your financial data through Claude
- Process transaction and budget operations you explicitly request
- Provide financial insights and summaries

## Data Storage

- Authentication tokens are stored locally on your device in the Docker container's volume
- We do not store your financial data on any external servers
- All data processing happens locally on your device
- No data is shared with third parties

## Data Security

We implement the following security measures:
- OAuth 2.0 secure authentication
- Local encrypted storage of tokens
- No persistent storage of financial data
- Automatic token expiration and refresh

## Third-Party Access

The YNAB MCP acts as a bridge between Claude and your YNAB account. We do not:
- Share your data with any third parties
- Use your data for advertising or marketing
- Collect or store data beyond what's necessary for operation

## User Rights

You have the right to:
- Remove your YNAB account from the integration at any time
- Revoke API access through your YNAB account settings
- Request information about what data is stored locally

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on the GitHub repository. You are advised to review this Privacy Policy periodically for any changes.

## Contact Us

If you have any questions about this Privacy Policy, please open an issue on the GitHub repository or contact me at mattweg@gmail.com.