import { H3Event } from 'h3'
import type { Job } from './jobStorage'

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook'
  config: EmailConfig | SlackConfig | WebhookConfig
  enabled: boolean
}

interface EmailConfig {
  recipients: string[]
  from?: string
}

interface SlackConfig {
  webhookUrl: string
  channel?: string
}

interface WebhookConfig {
  url: string
  headers?: Record<string, string>
}

export interface NotificationTrigger {
  onStart: boolean
  onComplete: boolean
  onFailure: boolean
  onPause: boolean
  failureThreshold?: number  // Percentage of failed calls to trigger notification
  progressInterval?: number  // Minutes between progress updates
}

export interface NotificationConfig {
  channels: NotificationChannel[]
  triggers: NotificationTrigger
}

export class NotificationManager {
  private config: NotificationConfig
  private event: H3Event

  constructor(config: NotificationConfig, event: H3Event) {
    this.config = config
    this.event = event
  }

  async notifyJobStart(job: Job) {
    if (!this.config.triggers.onStart) return

    const message = {
      title: `Job Started: ${job.name}`,
      body: `Started processing ${job.totalCalls} calls`,
      type: 'info',
      job
    }

    await this.sendToAllChannels(message)
  }

  async notifyJobComplete(job: Job) {
    if (!this.config.triggers.onComplete) return

    const message = {
      title: `Job Completed: ${job.name}`,
      body: `Completed ${job.completedCalls}/${job.totalCalls} calls`,
      type: 'success',
      job
    }

    await this.sendToAllChannels(message)
  }

  async notifyJobFailure(job: Job, error?: string) {
    if (!this.config.triggers.onFailure) return

    // Check failure threshold
    const failureRate = (job.failedCalls / job.totalCalls) * 100
    if (this.config.triggers.failureThreshold && 
        failureRate < this.config.triggers.failureThreshold) {
      return
    }

    const message = {
      title: `Job Failed: ${job.name}`,
      body: `Failed: ${job.failedCalls} calls\nError: ${error || 'Unknown error'}`,
      type: 'error',
      job
    }

    await this.sendToAllChannels(message)
  }

  async notifyJobPause(job: Job) {
    if (!this.config.triggers.onPause) return

    const message = {
      title: `Job Paused: ${job.name}`,
      body: `Progress: ${job.progress}%\nCompleted: ${job.completedCalls}/${job.totalCalls}`,
      type: 'warning',
      job
    }

    await this.sendToAllChannels(message)
  }

  async notifyProgressUpdate(job: Job) {
    if (!this.config.triggers.progressInterval) return

    const message = {
      title: `Job Progress: ${job.name}`,
      body: `Progress: ${job.progress}%\nCompleted: ${job.completedCalls}/${job.totalCalls}`,
      type: 'info',
      job
    }

    await this.sendToAllChannels(message)
  }

  private async sendToAllChannels(message: any) {
    const promises = this.config.channels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannel(channel, message))

    await Promise.all(promises)
  }

  private async sendToChannel(channel: NotificationChannel, message: any) {
    switch (channel.type) {
      case 'email':
        return this.sendEmail(channel.config as EmailConfig, message)
      case 'slack':
        return this.sendSlack(channel.config as SlackConfig, message)
      case 'webhook':
        return this.sendWebhook(channel.config as WebhookConfig, message)
    }
  }

  private async sendEmail(config: EmailConfig, message: any) {
    const runtimeConfig = useRuntimeConfig()
    
    // Implement email sending using your preferred email service
    // Example using a hypothetical email service:
    try {
      await $fetch(runtimeConfig.emailServiceUrl, {
        method: 'POST',
        body: {
          to: config.recipients,
          from: config.from || runtimeConfig.defaultEmailFrom,
          subject: message.title,
          text: message.body,
          html: this.formatEmailHtml(message)
        }
      })
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  private async sendSlack(config: SlackConfig, message: any) {
    try {
      await $fetch(config.webhookUrl, {
        method: 'POST',
        body: {
          channel: config.channel,
          text: message.title,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: message.title
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: message.body
              }
            }
          ]
        }
      })
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  private async sendWebhook(config: WebhookConfig, message: any) {
    try {
      await $fetch(config.url, {
        method: 'POST',
        headers: config.headers,
        body: {
          title: message.title,
          body: message.body,
          type: message.type,
          job: message.job
        }
      })
    } catch (error) {
      console.error('Failed to send webhook notification:', error)
    }
  }

  private formatEmailHtml(message: any) {
    return `
      <h1>${message.title}</h1>
      <p style="white-space: pre-line">${message.body}</p>
      <hr>
      <p><small>Sent by Call Queue System</small></p>
    `
  }
}
