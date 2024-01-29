import { MailService } from './mail.service';
import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';

@Module({
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
