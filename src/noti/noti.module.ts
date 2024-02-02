import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Noti, NotiSchema } from './schema/noti.schema';
import { NotiGateway } from './noti.gateway';
import { UsersModule } from 'src/users/users.module';
import { NotiService } from './noti.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: Noti.name, schema: NotiSchema }]),
  ],
  providers: [NotiGateway, NotiService],
  exports: [NotiGateway, NotiService],
})
export class NotiModule {}
