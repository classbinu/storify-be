import * as nodemailer from 'nodemailer';

import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private trnaspoter: nodemailer.Transporter;

  constructor() {
    this.trnaspoter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      // requireTLS: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    };
    await this.trnaspoter.sendMail(mailOptions);
  }

  async sendWelcomeMail(to: string, username: string) {
    const subject = `[스토리파이] ${username}님, 환영합니다!`;
    const html = `
      <div>
        <h1>Welcome ${username}</h1>
        <p>Thank you for joining us!</p>
      </div>
    `;
    await this.sendMail(to, subject, html);
  }
}
