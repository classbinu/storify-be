import { Book, BookSchema } from './schema/book.schema';
import { BookHistory, BookHistorySchema } from './schema/book-history.schema';
import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { BookMongoRepository } from './books.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { NotiModule } from 'src/noti/noti.module';
import { StoragesModule } from 'src/storages/storages.module';
import { UsersModule } from 'src/users/users.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookHistory.name, schema: BookHistorySchema },
    ]),
    StoragesModule,
    UtilsModule,
    NotiModule,
    JwtModule,
    forwardRef(() => UsersModule),
    AuthModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, BookMongoRepository],
  exports: [BooksService, BookMongoRepository],
})
export class BooksModule {}
