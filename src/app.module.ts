import { ConfigModule, ConfigService } from '@nestjs/config';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoragesModule } from './storages/storages.module';
import { StoriesModule } from './stories/stories.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { FriendReqsModule } from './friendReqs/friendReqs.module';
import { FriendsModule } from './friends/friends.module';
import { NotiModule } from './noti/noti.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BooksModule,
    StoriesModule,
    AiModule,
    StoragesModule,
    MailModule,
    FriendReqsModule,
    FriendsModule,
    NotiModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
