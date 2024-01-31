import { Module } from '@nestjs/common';
import { StoragesService } from './storages.service';
import { ConfigModule } from '@nestjs/config';
import { StoragesController } from './storages.controller';

@Module({
  imports: [ConfigModule],
  providers: [StoragesService],
  exports: [StoragesService],
  controllers: [StoragesController],
})
export class StoragesModule {}
