import { Injectable } from '@nestjs/common';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { StoryMongoRepository } from './stories.repository';
import { Story } from './schema/story.schema';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class StoriesService {
  constructor(
    private storyRepository: StoryMongoRepository,
    private readonly aiService: AiService,
  ) {}

  async createStory(createStoryDto: CreateStoryDto): Promise<Story> {
    this.aiService.langchain(createStoryDto);
    return this.storyRepository.createStory(createStoryDto);
  }

  async findAllStroy(): Promise<Story[]> {
    return this.storyRepository.findAllStroy();
  }

  async findStoryById(id: string): Promise<Story> {
    return this.storyRepository.findStoryById(id);
  }

  async updateStory(
    id: string,
    updateStoryDto: UpdateStoryDto,
  ): Promise<Story> {
    return this.storyRepository.updateStory(id, updateStoryDto);
  }

  async deleteStory(id: string): Promise<Story> {
    return this.storyRepository.deleteStory(id);
  }
}
