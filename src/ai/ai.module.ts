import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BooksModule } from 'src/books/books.module';
import { Module } from '@nestjs/common';
import { StoragesService } from 'src/storages/storages.service';

@Module({
  imports: [BooksModule],
  controllers: [AiController],
  providers: [AiService, StoragesService],
})
export class AiModule {}
