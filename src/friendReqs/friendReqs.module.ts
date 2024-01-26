import { Module } from '@nestjs/common';
import { FriendReqsService } from './friendReqs.service';
import { FriendReqsController } from './friendReqs.controller';
import { FriendReqMongoRepository } from './friendReqs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendReq, FriendReqSchema } from './schema/friendReq.schema';
import { Friend, FriendSchema } from 'src/friends/schema/friend.schema';
import { FriendsMongoRepository } from 'src/friends/friends.repository';
import { FriendsModule } from 'src/friends/friends.module';
import { NotiModule } from 'src/noti/noti.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendReq.name, schema: FriendReqSchema },
      { name: Friend.name, schema: FriendSchema },
    ]),
    FriendsModule,
    UsersModule,
    NotiModule,
  ],
  controllers: [FriendReqsController],
  providers: [
    FriendReqsService,
    FriendReqMongoRepository,
    FriendsMongoRepository,
  ],
  exports: [FriendsMongoRepository],
})
export class FriendReqsModule {}
