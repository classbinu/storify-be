import { Test, TestingModule } from '@nestjs/testing';

import { MailController } from '../mail.controller';
import { MailService } from '../mail.service';

describe('MailController', () => {
  let controller: MailController;
  let mockMailService: Partial<MailService>;

  beforeEach(async () => {
    mockMailService = {
      sendFeedbackMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('메일이 발송이 성공합니다.', async () => {
    const feedbackMailDto = { feedback: 'Test feedback' };
    const req = { user: { sub: '1234' } };

    // 에러가 발생하지 않는지 확인
    await expect(
      controller.sendFeedbackMeil(req, feedbackMailDto),
    ).resolves.not.toThrow();

    // sendFeedbackMail 메서드가 호출되었는지 확인
    expect(mockMailService.sendFeedbackMail).toHaveBeenCalledWith(
      feedbackMailDto,
      '1234',
    );
  });

  it('피드백(본문)이 없을 때 에러가 발생합니다.', async () => {
    const feedbackMailDto = { feedback: '' };
    const req = { user: { sub: '1234' } };
    await expect(
      controller.sendFeedbackMeil(req, feedbackMailDto),
    ).rejects.toThrow('Feedback is required');
  });
});
