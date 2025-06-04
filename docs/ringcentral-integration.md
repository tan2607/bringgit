# RingCentral Integration

This document outlines the RingCentral integration for retrieving call recordings in the KeyReply Next application.

## Overview

The RingCentral integration allows you to:

1. Fetch recent call recordings from your RingCentral account
2. Play recordings directly in the browser
3. Download recordings for offline use

## Setup

### RingCentral Developer Account

1. Sign up for a [RingCentral Developer Account](https://developers.ringcentral.com/login.html#/)
2. Create a new application in the RingCentral Developer Console
3. Set the application type to "Server-only (No UI)"
4. Request the following permissions:
   - Read Call Log
   - Read Call Recording

### Environment Variables

Add the following environment variables to your `.env` file:

```
RINGCENTRAL_CLIENT_ID=your_client_id
RINGCENTRAL_CLIENT_SECRET=your_client_secret
RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com
RINGCENTRAL_USERNAME=your_phone_number
RINGCENTRAL_EXTENSION=your_extension
RINGCENTRAL_PASSWORD=your_password
```

For sandbox testing, use `https://platform.devtest.ringcentral.com` as the server URL.

## Usage

### API Endpoints

The following API endpoints are available:

#### Get Recent Call Recordings

```
GET /api/callRecordings
```

Query parameters:
- `dateFrom` (optional): Start date in ISO format
- `dateTo` (optional): End date in ISO format
- `limit` (optional): Maximum number of recordings to return (default: 10)
- `mock` (optional): Set to 'true' to use mock data

#### Get a Specific Call Recording

```
GET /api/callRecordings/:id
```

Query parameters:
- `content` (optional): Set to 'true' to get the audio content
- `mock` (optional): Set to 'true' to use mock data

### Vue Component

The `CallRecordings.vue` component provides a user interface for viewing, playing, and downloading call recordings.

Example usage:

```vue
<template>
  <CallRecordings />
</template>

<script setup>
// No additional setup required
</script>
```

## Demo Page

A demo page is available at `/demo/call-recordings` to showcase the RingCentral integration.

## Technical Implementation

The RingCentral integration consists of:

1. `ringcentral.ts`: Provider class for interacting with the RingCentral API
2. API endpoints for retrieving recordings
3. Vue component for displaying recordings

### Mock Data

The integration includes a mock data mode for testing without actual RingCentral credentials. This is useful for development and demonstration purposes.

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your RingCentral credentials are correct
2. **Permission Errors**: Verify that your RingCentral app has the necessary permissions
3. **API Rate Limits**: RingCentral has rate limits that may affect frequent API calls

### Logs

Check the server logs for detailed error messages when troubleshooting RingCentral API issues.

## References

- [RingCentral API Reference](https://developers.ringcentral.com/api-reference)
- [RingCentral SDK Documentation](https://www.npmjs.com/package/@ringcentral/sdk)
