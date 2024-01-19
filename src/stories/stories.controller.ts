import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './schema/story.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Stories')
@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post()
  createStory(@Body() createStoryDto: CreateStoryDto): Promise<Story> {
    return this.storiesService.createStory(createStoryDto);
  }

  @Post('ai')
  createAiStory(@Body() createStoryDto: CreateStoryDto): Promise<Story> {
    return this.storiesService.createAiStory(createStoryDto);
  }

  @Get()
  findAllStory(): Promise<Story[]> {
    return this.storiesService.findAllStroy();
  }

  @Get(':id')
  findStoryById(@Param('id') id: string): Promise<Story> {
    return this.storiesService.findStoryById(id);
  }

  @Patch(':id')
  updateStory(
    @Param('id') id: string,
    @Body() updateStoryDto: UpdateStoryDto,
  ): Promise<Story> {
    return this.storiesService.updateStory(id, updateStoryDto);
  }

  @Delete(':id')
  deleteStory(@Param('id') id: string): Promise<Story> {
    return this.storiesService.deleteStory(id);
  }
}
