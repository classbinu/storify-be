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
    return this.storyRepository.createStory(createStoryDto);
  }

  async createAiStory(createStoryDto: CreateStoryDto): Promise<Story> {
    const newStory = await this.storyRepository.createStory(createStoryDto);
    return this.aiService.langchain(createStoryDto, newStory._id);
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
