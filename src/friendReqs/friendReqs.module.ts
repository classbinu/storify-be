import { Module } from '@nestjs/common';
import { FriendReqsService } from './friendReqs.service';
import { FriendReqsController } from './friendReqs.controller';
import { FriendReqMongoRepository } from './friendReqs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendReq, FriendReqSchema } from './schema/friendReq.schema';
import { Friend, FriendSchema } from 'src/friends/schema/friend.schema';
import { FriendsMongoRepository } from 'src/friends/friends.repository';
import { FriendsModule } from 'src/friends/friends.module';
import { UsersModule } from 'src/users/users.module';
import { NotiGateway } from 'src/noti/noti.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendReq.name, schema: FriendReqSchema },
      { name: Friend.name, schema: FriendSchema },
    ]),
    FriendsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [FriendReqsController],
  providers: [
    FriendReqsService,
    FriendReqMongoRepository,
    FriendsMongoRepository,
    NotiGateway,
  ],
  exports: [FriendsMongoRepository],
})
export class FriendReqsModule {}
