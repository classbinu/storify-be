import { Book, BookSchema } from './schema/book.schema';

import { BookMongoRepository } from './books.repository';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoragesModule } from 'src/storages/storages.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    StoragesModule,
    UtilsModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, BookMongoRepository],
  exports: [BooksService],
})
export class BooksModule {}
