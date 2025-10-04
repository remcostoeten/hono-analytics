# Documentation Update: API Keys

## Changes Made

### New Page: API Keys Documentation

Created `/docs/api-keys` with comprehensive beginner-friendly guidance:

#### What's Included:

1. **Clear Explanation** - What API keys are and why they're needed
2. **Three Methods to Generate Keys**:
   - Environment variable (quickest for beginners)
   - Database seed script (recommended)
   - Direct database insert (advanced)

3. **Practical Examples**:
   - How to use keys in client SDK
   - How to use keys in dashboard
   - How to store keys securely in environment variables

4. **Multi-Project Management** - Guide for managing multiple projects

5. **Security Best Practices** - Do's and don'ts

6. **Troubleshooting Section**:
   - "Invalid API key" error
   - "API key required" error
   - Can't find my API key

7. **Quick Start Checklist** - 4 simple steps to get started

### Updated: Getting Started Guide

Enhanced the getting started documentation:

- Added "Get Your API Key" section
- Changed all examples to use concrete key: `dev-key-12345`
- Added clear explanations after each code example
- Linked to the API Keys guide for production usage
- Showed how to generate secure keys for production

### Updated: Overview Page

Added API Keys to the main navigation cards for easy discovery.

## For Beginners

The simplest path is now:

1. Open `packages/backend/.env`
2. See `DEFAULT_API_KEY=dev-key-12345`
3. Use that exact key in your code
4. Done

No confusion about "where do I get this?" anymore.

## Build Status

Documentation rebuilt successfully:
- 20 static pages generated
- New `/docs/api-keys` page included
- All syntax highlighting working
- Search index updated
