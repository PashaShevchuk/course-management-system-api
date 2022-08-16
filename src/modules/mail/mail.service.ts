import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class MailService {
  private readonly isEmailEnable: boolean;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.isEmailEnable = this.configService.isEmailEnable();
  }

  async sendMail(email: string, template: string, subject?: string, context?) {
    if (this.isEmailEnable) {
      await this.mailerService.sendMail({
        from: 'no-reply@coursemanagement.com',
        to: email,
        subject: subject || 'Course Management System',
        template: `/${template}`,
        context,
      });
    }
  }
}
