# Queue Management

The call scheduling system uses CloudFlare Queues integrated with Nuxt to manage outbound calls reliably and efficiently. This document explains how the queue system works and how to manage it.

## Overview

The Queue Management system provides comprehensive tools for managing outbound call jobs, scheduling, analytics, and reporting. It includes features for job creation, monitoring, scheduling, and performance analysis.

## Key Features

### Job Management
- Create and schedule call jobs with multiple recipients
- Bulk operations (start, pause, delete)
- Real-time job status monitoring
- Quick view drawer for job details
- Advanced search and filtering capabilities
- Drag-and-drop job prioritization
- Saved views for frequent searches

### Advanced Scheduling
- Business hours with timezone support
- Blackout periods for maintenance and holidays
- Priority windows for scheduling jobs
- Schedule validation and next available time calculation
- Rate limiting for concurrent calls
- Per-job and global rate limits

### Analytics & Reporting
- Performance Metrics
  - Success rate tracking
  - Call duration analysis
  - Peak hour detection
  - Cost tracking
  - Failure reason analysis
  - Completion time metrics
  
- Interactive Dashboard
  - Real-time data refresh
  - Date range filtering
  - Status and assistant filters
  - Visual charts and graphs
  - Call volume analysis
  - Cost analysis
  - Detailed metrics view

### Notification System
- Multiple notification channels
  - Email notifications
  - Slack integration
  - Webhook support
- Configurable triggers
  - Job start/completion
  - Failure alerts
  - Progress updates
- Custom notification templates
- Channel management

## Rate Limiting

The system implements two levels of rate limiting:
- Per-job limit: 1 concurrent call
- Global limit: 10 concurrent calls

When limits are reached:
- Messages are automatically requeued
- 5-second delay between retries
- Progress tracking maintained

## Advanced Scheduling

### Business Hours
```typescript
interface BusinessHours {
  daysOfWeek: number[]    // 0-6, 0 is Sunday
  startTime: string       // HH:mm format
  endTime: string        // HH:mm format
  timezone: string       // IANA timezone
}
```

- Define working days and hours
- Timezone support for global operations
- Automatic scheduling within business hours
- Messages outside hours are delayed

### Blackout Periods
```typescript
interface BlackoutPeriod {
  start: Date
  end: Date
  reason?: string
}
```

- Schedule system downtime
- Holiday management
- Maintenance windows
- Custom blackout reasons

### Priority Windows
```typescript
interface PriorityWindow {
  startTime: string    // HH:mm format
  endTime: string     // HH:mm format
  priority: number    // 1-5, 1 is highest
}
```

- Define high-priority time slots
- Multiple priority levels (1-5)
- Automatic priority assignment
- Flexible window configuration

## Job States

A job can be in one of these states:
- `pending`: Job is created but not started
- `running`: Job is actively processing calls
- `paused`: Job processing is temporarily suspended
- `completed`: All calls in the job are processed
- `failed`: Job encountered unrecoverable errors

Each job tracks:
- Total calls
- Completed calls
- Failed calls
- Failed phone numbers
- Progress percentage
- Last processed timestamp
- Error messages

## Real-time Updates

The system provides real-time updates using Server-Sent Events:
```typescript
const { jobUpdates, connected } = useJobUpdates()

// Get updates for a specific job
const updates = jobUpdates.value.filter(update => update.jobId === jobId)
```

Updates include:
- Job status changes
- Progress updates
- Error notifications
- Completion status

## Error Handling

The system handles various error scenarios:

1. **Phone Number Validation**
   - Validates format before enqueueing
   - Tracks invalid numbers
   - Provides detailed error messages

2. **Call Failures**
   - Automatic retry up to 3 times
   - Tracks failed numbers
   - Logs error messages
   - Updates job status

3. **System Errors**
   - Connection issues
   - API failures
   - Queue processing errors
   - Schedule validation errors

## Job Management

### Creating a Job
```typescript
const job = await createJob({
  name: 'Campaign Name',
  schedule: new Date(),
  phoneNumbers: ['1234567890'],
  assistantId: 'assistant-id',
  phoneNumberId: 'number-id'
})
```

### Managing Schedule
```typescript
// Get next available time slot
const nextSlot = scheduler.getNextAvailableTime()

// Validate schedule
const validation = scheduler.validateSchedule(date)
if (!validation.isValid) {
  console.log(validation.reason)
}

// Get current priority
const priority = scheduler.getCurrentPriority()
```

## Usage

### Creating a Job
1. Navigate to the Job Manager
2. Click "Create Job"
3. Fill in job details:
   - Recipients list
   - Schedule preferences
   - Priority settings
   - Notification preferences
4. Review and submit

### Managing Jobs
- Use bulk actions for multiple jobs
- Filter jobs by status, date, or assistant
- View detailed job statistics
- Monitor real-time progress
- Adjust job priorities as needed

### Configuring Schedules
1. Set business hours with timezone
2. Define blackout periods
3. Configure priority windows
4. Set rate limits

### Analyzing Performance
1. Access the Analytics Dashboard
2. Select date range and filters
3. View key metrics:
   - Success rates
   - Call volumes
   - Cost analysis
   - Failure patterns
4. Export reports as needed

## Best Practices
1. Regular monitoring of job progress
2. Setting appropriate rate limits
3. Configuring notifications for critical events
4. Reviewing analytics for optimization
5. Maintaining blackout periods
6. Regular schedule reviews

## API Reference

### Job Interface
```typescript
interface Job {
  id: string
  name: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  totalCalls: number
  completedCalls: number
  failedCalls: number
  failedNumbers: string[]
  phoneNumbers: string[]
  assistantId: string
  phoneNumberId: string
  lastProcessedAt?: Date
  notes?: string
}
```

### Queue Messages
```typescript
interface CallMessage {
  jobId: string
  phoneNumber: string
  assistantId: string
  phoneNumberId: string
  retryCount?: number
  priority?: number
}
```

### Job Management
```typescript
interface Job {
  id: string
  name: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  totalCalls: number
  completedCalls: number
  failedCalls: number
  schedule: Date
  priority: number
}
```

### Scheduling
```typescript
interface ScheduleConfig {
  businessHours: BusinessHours
  blackoutPeriods: BlackoutPeriod[]
  priorityWindows: PriorityWindow[]
  defaultPriority: number
}
```

### Analytics
```typescript
interface JobMetrics {
  successRate: number
  avgCallDuration: number
  peakHours: { hour: number; count: number }[]
  costPerCall: number
  failureReasons: Map<string, number>
  totalCost: number
  completionTime: number
}
```

### Notifications
```typescript
interface NotificationConfig {
  channels: NotificationChannel[]
  triggers: NotificationTrigger
}
```

## Security

The system implements several security measures:
- Input validation
- Error logging
- Rate limiting
- Access control
- Schedule validation

## Troubleshooting
1. Job not starting
   - Check business hours
   - Verify blackout periods
   - Check rate limits
   
2. High failure rates
   - Review error patterns
   - Check recipient data
   - Verify network conditions
   
3. Performance issues
   - Monitor concurrent calls
   - Review peak hours
   - Adjust rate limits

## Support
For additional support or feature requests, please contact our support team.
