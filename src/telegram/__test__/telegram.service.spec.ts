import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../telegram.service';

describe('TelegramService', () => {
  let service: TelegramService;
  let configService: ConfigService;
  let mockTelegramBot: any;

  beforeEach(async () => {
    mockTelegramBot = {
      sendMessage: jest.fn().mockResolvedValue({ message_id: 123 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'TELEGRAM_CHANNEL_ID') return 'test-channel-id';
              return null;
            }),
          },
        },
        {
          provide: 'TELEGRAM_BOT',
          useValue: mockTelegramBot,
        },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('sendMessage 함수가 파라미터와 함께 올바르게 호출됩니다.', async () => {
    const sendTelegramDto = { message: 'Test message' };
    const channelId = configService.get('TELEGRAM_CHANNEL_ID');
    await service.sendMessage(sendTelegramDto);

    expect(mockTelegramBot.sendMessage).toHaveBeenCalledWith(
      channelId,
      sendTelegramDto.message,
    );
  });

  it('텔레그램 메시지가 정상적으로 전송됩니다.', async () => {
    const sendTelegramDto = { message: 'Test message' };
    const result = await service.sendMessage(sendTelegramDto);

    expect(result).toEqual({ message_id: 123 });
  });

  it('메시지가 없을 경우 에러가 발생합니다.', async () => {
    const sendTelegramDto = { message: '' };

    await expect(service.sendMessage(sendTelegramDto)).rejects.toThrow(
      '메시지를 입력해주세요.',
    );
  });
});
