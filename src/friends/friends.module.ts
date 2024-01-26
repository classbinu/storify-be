import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { FriendSchema } from './schema/friend.schema';
import { FriendsMongoRepository } from './friends.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Friend', schema: FriendSchema }]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService, FriendsMongoRepository],
})
export class FriendsModule {}
