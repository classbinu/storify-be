// import { AiService } from 'src/ai/ai.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { Injectable } from '@nestjs/common';
import { Story } from './schema/story.schema';
import { StoryMongoRepository } from './stories.repository';
import { UpdateStoryDto } from './dto/update-story.dto';

@Injectable()
export class StoriesService {
  constructor(
    private storyRepository: StoryMongoRepository,
    // private readonly aiService: AiService,
  ) {}

  async createStory(createStoryDto: CreateStoryDto): Promise<Story> {
    return this.storyRepository.createStory(createStoryDto);
  }

  // async createAiStory(createStoryDto: CreateStoryDto): Promise<Story> {
  //   const newStory = await this.storyRepository.createStory(createStoryDto);
  //   return this.aiService.langchain(
  //     createStoryDto,
  //     newStory._id,
  //     createStoryDto.userId,
  //   );
  // }

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
