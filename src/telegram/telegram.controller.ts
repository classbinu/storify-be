import { Body, Controller, Post } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { SendTelegramDto } from './dto/send-telegram.dto';
import { TelegramService } from './telegram.service';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post()
  async sendMessage(@Body() sendTelegramDto: SendTelegramDto): Promise<void> {
    return this.telegramService.sendMessage(sendTelegramDto);
  }
}
