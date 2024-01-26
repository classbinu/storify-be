import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';
import { Story } from './schema/story.schema';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('Stories')
@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post()
  createStory(@Body() createStoryDto: CreateStoryDto): Promise<Story> {
    return this.storiesService.createStory(createStoryDto);
  }

  // @UseGuards(AccessTokenGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'API 분리 중. 사용 금지.' })
  // @Post('ai')
  // createAiStory(
  //   @Req() req: any,
  //   @Body() createStoryDto: CreateStoryDto,
  // ): Promise<Story> {
  //   const userId = req.user['sub'];
  //   createStoryDto.userId = userId;
  //   return this.storiesService.createAiStory(createStoryDto);
  // }

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
