import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from './schema/story.schema';
import { StoryMongoRepository } from './stories.repository';
import { AiModule } from 'src/ai/ai.module';
import { AiService } from 'src/ai/ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
    AiModule,
  ],
  controllers: [StoriesController],
  providers: [StoriesService, StoryMongoRepository, AiService],
})
export class StoriesModule {}
