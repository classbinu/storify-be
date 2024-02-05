import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BooksModule } from 'src/books/books.module';
import { Module } from '@nestjs/common';
import { StoragesService } from 'src/storages/storages.service';
import { StoriesModule } from 'src/stories/stories.module';
import { TelegramService } from 'src/telegram/telegram.service';

@Module({
  imports: [BooksModule, StoriesModule],
  controllers: [AiController],
  providers: [AiService, StoragesService, TelegramService],
  exports: [AiService],
})
export class AiModule {}
