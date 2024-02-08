import * as nodemailer from 'nodemailer';

import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../mail.service';

jest.mock('nodemailer');
const createTransportMock = nodemailer.createTransport as jest.MockedFunction<
  typeof nodemailer.createTransport
>;

describe('MailService', () => {
  let service: MailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn();
    createTransportMock.mockReturnValue({ sendMail: sendMailMock });

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sendMail 메서드가 호출되었습니다.', async () => {
    const to = 'test@example.com';
    const subject = 'Test subject';
    const html = '<div>Test html</div>';

    await service.sendMail(to, subject, html);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.MAIL_USER,
      to,
      subject,
      html,
    });
  });

  it('sendMail 메서드가 에러를 던집니다.', async () => {
    const to = 'test@example.com';
    const subject = 'Test subject';
    const html = '<div>Test html</div>';
    const error = new Error('Error sendMail');

    sendMailMock.mockRejectedValue(error);

    await expect(service.sendMail(to, subject, html)).rejects.toThrow(error);
  });

  it('sendWelcomeMail 메서드가 호출되었습니다.', async () => {
    const to = 'test@example.com';
    const userId = 'testUser';

    await service.sendWelcomeMail(to, userId);
    expect(sendMailMock).toHaveBeenCalled();
  });

  it('sendResetPasswordMail 메서드가 호출되었습니다.', async () => {
    const to = 'test@example.com';
    const userId = 'testUser';
    const token = '9999';

    await service.sendResetPasswordMail(to, userId, token);

    expect(sendMailMock).toHaveBeenCalled();
  });

  it('sendFeedbackMail 메서드가 호출되었습니다.', async () => {
    const feedbackMailDto = { feedback: 'Test feedback' };
    const userId = 'testUser';

    await service.sendFeedbackMail(feedbackMailDto, userId);
    expect(sendMailMock);
  });
});
