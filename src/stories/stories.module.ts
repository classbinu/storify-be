import { Story, StorySchema } from './schema/story.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { StoryMongoRepository } from './stories.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService, StoryMongoRepository],
  exports: [StoriesService],
})
export class StoriesModule {}
