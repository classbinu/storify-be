import { Module } from '@nestjs/common';
import { StoragesService } from './storages.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [StoragesService],
  exports: [StoragesService],
})
export class StoragesModule {}
