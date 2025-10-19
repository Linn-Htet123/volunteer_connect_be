import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send task assignment email to a volunteer
   */
  async sendTaskAssignedMail(
    to: string,
    task: {
      title: string;
      event?: { name: string };
      start_date: Date;
      end_date: Date;
      location: string;
    },
    volunteer: {
      name: string;
    },
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `You have been assigned a new task: ${task.title}`,
        template: './task-assigned',
        context: {
          volunteerName: volunteer.name,
          taskTitle: task.title,
          eventName: task.event?.name,
          startDate: task.start_date,
          endDate: task.end_date,
          location: task.location,
        },
      });

      this.logger.log(`Task assignment email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
    }
  }

  /**
   * Generic send function (you can reuse this)
   */
  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ) {
    try {
      await this.mailerService.sendMail({ to, subject, template, context });
      this.logger.log(`Email sent to ${to} using template: ${template}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
    }
  }
}
