import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotiGateway } from './noti.gateway';

@Module({
  imports: [AuthModule],
  providers: [NotiGateway],
})
export class NotiModule {}
