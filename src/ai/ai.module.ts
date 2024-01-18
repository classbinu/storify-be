import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Module } from '@nestjs/common';
import { StoragesService } from 'src/storages/storages.service';

@Module({
  controllers: [AiController],
  providers: [AiService, StoragesService],
})
export class AiModule {}
