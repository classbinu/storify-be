import * as nodemailer from 'nodemailer';

import { FeedbackMailDto } from './dto/feedback-mail.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly trnaspoter: nodemailer.Transporter;

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
    try {
      await this.trnaspoter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
      throw new Error('Error sendMail');
    }
  }

  async sendWelcomeMail(to: string, userId: string) {
    const subject = `[스토리파이] ${userId}님, 환영합니다!`;
    const html = `
      <div>
        <h1>${userId}님, 환영합니다!</h1>
        <p>스토리파이에 가입해 주셔서 고맙습니다.</p>
      </div>
    `;
    try {
      await this.sendMail(to, subject, html);
    } catch (error) {
      console.error(error);
      throw new Error('Error sendWelcomeMail');
    }
  }

  async sendResetPasswordMail(to: string, userId: string, token: string) {
    const subject = `[스토리파이] ${userId}님, 비밀번호를 재설정하세요`;
    const html = `
      <div>
        <h1>비밀번호 재설정</h1>
        <p>아래 링크를 클릭해서 비밀번호를 재설정하세요.(링크 유효 시간: 24시간)</p>
        <a href="http://127.0.0.1:3000/reset-password/${token}">Reset password</a>
      </div>
    `;
    try {
      await this.sendMail(to, subject, html);
    } catch (error) {
      console.error(error);
      throw new Error('Error sendResetPasswordMail');
    }
  }

  async sendFeedbackMail(feedbackMailDto: FeedbackMailDto, userId: string) {
    const to = 'jungle.storify@gmail.com';
    const subject = `[피드백] ${userId}님의 피드백입니다.`;
    const html = `
      <div>
        <p>${feedbackMailDto.feedback}</p>
      </div>
    `;
    try {
      await this.sendMail(to, subject, html);
    } catch (error) {
      console.error(error);
      throw new Error('Error sendWelcomeMail');
    }
  }
}
