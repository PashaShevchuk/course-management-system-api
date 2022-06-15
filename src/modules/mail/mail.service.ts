import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(email: string, template: string, subject?: string, context?) {
    await this.mailerService.sendMail({
      from: 'no-reply@coursemanagement.com',
      to: email,
      subject: subject || 'Course Management System',
      template: `/${template}`,
      context,
    });
  }
}