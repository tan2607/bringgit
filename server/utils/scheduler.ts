import { now, parseTime, parseZonedDateTime, toZoned } from '@internationalized/date'

export interface BusinessHours {
  daysOfWeek: number[] // 0-6, 0 is Sunday
  startTime: string    // HH:mm format
  endTime: string      // HH:mm format
  timezone: string     // IANA timezone
}

export interface BlackoutPeriod {
  start: Date
  end: Date
  reason?: string
}

export interface PriorityWindow {
  startTime: string    // HH:mm format
  endTime: string      // HH:mm format
  priority: number     // 1-5, 1 is highest
}

export interface ScheduleConfig {
  businessHours: BusinessHours
  blackoutPeriods: BlackoutPeriod[]
  priorityWindows: PriorityWindow[]
  defaultPriority: number
}

export class Scheduler {
  private config: ScheduleConfig

  constructor(config: ScheduleConfig) {
    this.config = config
  }

  private formatTimeString(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.config.businessHours.timezone
    })
  }

  isBusinessHours(date: Date): boolean {

    const targetDate = new Date(date.toLocaleString('en-US', {
      timeZone: this.config.businessHours.timezone
    }))

    const dayOfWeek = targetDate.getDay()

    if (!this.config.businessHours.daysOfWeek.includes(dayOfWeek)) {
      return false
    }

    const targetDateHour = targetDate.getHours()
    const { startTime, endTime } = this.config.businessHours

    return targetDateHour >= parseInt(startTime) && targetDateHour <= parseInt(endTime)
  }

  isBlackoutPeriod(date: Date): BlackoutPeriod | null {
    const targetDate = new Date(date.toLocaleString('en-US', {
      timeZone: this.config.businessHours.timezone
    }))

    if (this.config.blackoutPeriods.length === 0) {
      return null
    }

    for (const period of this.config.blackoutPeriods) {
      if (targetDate >= period.start && targetDate <= period.end) {
        return period
      }
    }
    
    return null
  }

  getCurrentPriority(date: Date = new Date()): number {
    const timeStr = this.formatTimeString(new Date(date.toLocaleString('en-US', {
      timeZone: this.config.businessHours.timezone
    })))
    
    for (const window of this.config.priorityWindows) {
      if (timeStr >= window.startTime && timeStr <= window.endTime) {
        return window.priority
      }
    }
    
    return this.config.defaultPriority
  }

  getNextAvailableTime(fromDate: Date = new Date()): Date {
    let currentDate = new Date(fromDate.toLocaleString('en-US', {
      timeZone: this.config.businessHours.timezone
    }))
    
    // Maximum 7 days of searching to prevent infinite loops
    const maxAttempts = 7 * 24 * 12 // Check every 5 minutes for 7 days
    for (let i = 0; i < maxAttempts; i++) {
      // Skip if not business hours
      if (!this.isBusinessHours(currentDate)) {
        currentDate = new Date(currentDate.getTime() + 5 * 60 * 1000) // Add 5 minutes
        continue
      }
      
      // Skip if in blackout period
      const blackout = this.isBlackoutPeriod(currentDate)
      if (blackout) {
        currentDate = new Date(blackout.end.getTime() + 60 * 1000) // Add 1 minute after blackout ends
        continue
      }
      
      return currentDate
    }
    
    throw new Error('No available time found in the next 7 days')
  }

  validateSchedule(date: Date): {
    isValid: boolean
    reason?: string
  } {
    if (!this.isBusinessHours(date)) {
      return {
        isValid: false,
        reason: 'Outside business hours'
      }
    }

    const blackout = this.isBlackoutPeriod(date)
    if (blackout) {
      return {
        isValid: false,
        reason: `In blackout period: ${blackout.reason || 'No reason provided'}`
      }
    }

    return { isValid: true }
  }
}
