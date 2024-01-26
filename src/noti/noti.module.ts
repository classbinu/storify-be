import { Module } from '@nestjs/common';
import { NotiService } from './noti.service';

@Module({
  providers: [NotiService],
  exports: [NotiService],
})
export class NotiModule {}
