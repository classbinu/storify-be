import * as TelegramBot from 'node-telegram-bot-api';

import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { SendTelegramDto } from './dto/send-telegram.dto';

@Injectable()
export class TelegramService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('TELEGRAM_BOT') private readonly telegramBot: TelegramBot,
  ) {}

  async sendMessage(sendTelegramDto: SendTelegramDto): Promise<any> {
    const channelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID');

    if (!sendTelegramDto.message) {
      throw new Error('메시지를 입력해주세요.');
    }

    return await this.telegramBot.sendMessage(
      channelId,
      sendTelegramDto.message,
    );
  }
}
