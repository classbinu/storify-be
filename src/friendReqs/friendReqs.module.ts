import { Module } from '@nestjs/common';
import { FriendReqsService } from './friendReqs.service';
import { FriendReqsController } from './friendReqs.controller';
import { FriendReqMongoRepository } from './friendReqs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendSchema } from './schema/friendReq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'FriendReq', schema: FriendSchema }]),
  ],
  controllers: [FriendReqsController],
  providers: [FriendReqsService, FriendReqMongoRepository],
})
export class FriendReqsModule {}
