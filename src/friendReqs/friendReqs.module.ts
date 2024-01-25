import { Module } from '@nestjs/common';
import { FriendsService } from './friendReqs.service';
import { FriendsController } from './friendReqs.controller';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
