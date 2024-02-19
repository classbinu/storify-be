import * as TelegramBot from 'node-telegram-bot-api';

import { Global, Module } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';

@Global()
@Module({
  controllers: [TelegramController],
  providers: [
    TelegramService,
    {
      provide: 'TELEGRAM_BOT',
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('TELEGRAM_BOT_TOKEN');
        return new TelegramBot(token);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TelegramService, 'TELEGRAM_BOT'],
})
export class TelegramModule {}
