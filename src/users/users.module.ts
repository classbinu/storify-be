import { User, UserSchema } from './schema/user.schema';

import { AuthService } from 'src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserMongoRepository } from './users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FriendsMongoRepository } from 'src/friends/friends.repository';
import { FriendsModule } from 'src/friends/friends.module';
import { Friend, FriendSchema } from 'src/friends/schema/friend.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Friend.name, schema: FriendSchema },
    ]),
    FriendsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserMongoRepository,
    AuthService,
    JwtService,
    ConfigService,
    MailService,
    FriendsMongoRepository,
  ],
  exports: [UsersService, UserMongoRepository, FriendsMongoRepository],
})
export class UsersModule {}
