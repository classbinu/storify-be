import { Test, TestingModule } from '@nestjs/testing';

import { TelegramController } from '../telegram.controller';
import { TelegramService } from '../telegram.service';

describe('TelegramController', () => {
  let controller: TelegramController;
  let mockTelegramService: Partial<TelegramService>;

  beforeEach(async () => {
    mockTelegramService = {
      sendMessage: jest.fn().mockResolvedValue({
        message_id: 99,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramController],
      providers: [
        {
          provide: TelegramService,
          useValue: mockTelegramService,
        },
      ],
    }).compile();

    controller = module.get<TelegramController>(TelegramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sendMessage 메서드가 호출됩니다.', async () => {
    const sendTelegramDto = {
      message: 'test message',
    };

    await controller.sendMessage(sendTelegramDto);

    expect(mockTelegramService.sendMessage).toHaveBeenCalledWith(
      sendTelegramDto,
    );
  });

  it('sendMessage 메서드가 텔레그램 메시지 성공 전송 결과를 반환합니다. ', async () => {
    const sendTelegramDto = {
      message: 'test message',
    };

    const result = await controller.sendMessage(sendTelegramDto);

    expect(result).toEqual({ message_id: 99 });
  });

  it('sendMessage 메서드가 message 필드가 없는 경우 에러를 반환합니다.', async () => {
    const sendTelegramDto = {
      message: '',
    };

    await expect(controller.sendMessage(sendTelegramDto)).rejects.toThrow(
      'Required message field is missing.',
    );
  });
});
