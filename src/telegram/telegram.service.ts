import * as TelegramBot from 'node-telegram-bot-api';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { SendTelegramDto } from './dto/send-telegram.dto';

@Injectable()
export class TelegramService {
  constructor(private readonly configService: ConfigService) {}

  async sendMessage(sendTelegramDto: SendTelegramDto): Promise<any> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    // const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    const channelId = this.configService.get<string>('TELEGRAM_CHANNEL_ID');
    const bot = new TelegramBot(token);
    return await bot.sendMessage(channelId, sendTelegramDto.message);
  }
}
