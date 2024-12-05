import sgMail from '@sendgrid/mail'
import { BaseProvider } from './base'
import ical from 'ical-generator'

export interface CalendarInvite {
  startTime: Date
  endTime: Date
  subject: string
  description: string
  location: string
  organizer: {
    name: string
    email: string
  }
}

export class SendGridProvider extends BaseProvider {
  private client: typeof sgMail

  protected constructor(apiKey: string) {
    super()
    this.client = sgMail
    this.client.setApiKey(apiKey)
  }

  public static override getInstance(apiKey: string): SendGridProvider {
    return super.getInstance(apiKey)
  }

  async sendCalendarInvite(invite: CalendarInvite, recipientEmail: string): Promise<boolean> {
    const calendar = ical({
      name: 'Vitalus Health Appointment',
      timezone: 'America/Chicago'
    })

    calendar.createEvent({
      start: invite.startTime,
      end: invite.endTime,
      summary: invite.subject,
      description: invite.description,
      location: invite.location,
      organizer: {
        name: invite.organizer.name,
        email: invite.organizer.email
      }
    })

    const msg = {
      to: recipientEmail,
      from: "noreply@keyreply.com",
      subject: invite.subject,
      text: invite.description,
      html: `<p>${invite.description.replace(/\n/g, '<br>')}</p>`,
      attachments: [
        {
          content: Buffer.from(calendar.toString()).toString('base64'),
          filename: 'invite.ics',
          type: 'text/calendar; method=REQUEST',
          disposition: 'attachment'
        }
      ]
    }

    try {
      await this.client.send(msg)
      console.log('Calendar invite sent successfully to', recipientEmail)
      return true
    } catch (error) {
      console.error('Error sending calendar invite:', error)
      return false
    }
  }

  async sendEmail(options: {
    to: string
    subject: string
    text: string
    html?: string
  }): Promise<boolean> {
    const msg = {
      to: options.to,
      from: "noreply@keyreply.com",
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    }

    try {
      await this.client.send(msg)
      console.log('Email sent successfully to', options.to)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }
}
