import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BooksModule } from 'src/books/books.module';
import { Module } from '@nestjs/common';
import { StoragesService } from 'src/storages/storages.service';
import { StoriesModule } from 'src/stories/stories.module';

@Module({
  imports: [BooksModule, StoriesModule],
  controllers: [AiController],
  providers: [AiService, StoragesService],
  exports: [AiService],
})
export class AiModule {}
