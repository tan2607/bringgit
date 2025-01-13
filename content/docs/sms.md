---
title: SMS Messaging
description: Guide for using the SMS messaging feature
---

# SMS Messaging

The SMS feature allows you to send text messages to customers using predefined templates or AI-generated content. This component provides a user-friendly interface for composing and sending SMS messages with support for dynamic content and real-time status updates.

## Features

### 1. Phone Number Input
- Country code selection with flag icons (currently supporting Singapore +65)
- Phone number validation
- International format support

### 2. Message Templates
- **Predefined Templates**: Access a library of ready-to-use SMS templates
- **Template Categories**: Templates organized by categories for easy access
- **Dynamic Slots**: Support for variable content using slot placeholders (e.g., [name], [date])
- **Template Preview**: View and edit templates before sending

### 3. AI Template Generator
- Generate custom SMS templates using AI
- Customize generation parameters:
  - Purpose
  - Language selection
  - Tone options (professional, friendly, urgent, casual)
  - Maximum length control

### 4. Dynamic Content Support
- Date picker for date/time slots
- Text input for custom variables
- Real-time message preview with filled slots
- Character count display

### 5. Sending and Status
- Real-time sending status
- Success/error feedback with message ID
- Loading states and error handling
- Copy message ID functionality

## Usage

### Basic Usage
```vue
<template>
  <SmsTask />
</template>
```

### With Pre-selected Template
```vue
<template>
  <SmsTask :template-id="'appointment-reminder'" />
</template>
```

## Template Structure

Templates follow this structure:
```typescript
interface SmsTemplate {
  id: string
  category: string
  title: string
  message: string
  description?: string
}
```

## Response Types

The SMS sender returns responses in this format:
```typescript
interface SmsSuccessResponse {
  success: true
  message: string
  messageId: string
  status: string
  details: {
    to: string
    message: string
    timestamp: string
  }
}

interface SmsErrorResponse {
  success: false
  message: string
  details: {
    error: string
    timestamp: string
  }
}
```

## Best Practices

1. **Template Usage**: Use predefined templates when possible to maintain consistency
2. **Dynamic Content**: Test all dynamic slots before sending
3. **Error Handling**: Always check the response status
4. **Message Length**: Monitor character count to avoid message splitting
5. **Phone Numbers**: Always include country code

## Customization

The component uses Nuxt UI and can be customized using:
- Custom templates in `data/smsTemplates.ts`
- Tailwind CSS classes for styling
- Nuxt UI theme configuration
- Custom icons (using Lucide icons)

## API Integration

The SMS feature integrates with your SMS provider through the `/api/sms/send.post` endpoint. Ensure proper configuration of:
- API credentials
- Rate limits
- Error handling
- Response logging
