import { AiService } from './ai.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateAiStoryDto } from './dto/create-ai-story.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { CreateAiBookDto } from './dto/create-ai-book.dto';

@ApiTags('Ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('stories')
  async createAiStory(
    @Req() req: any,
    @Body() createAiStoryDto: CreateAiStoryDto,
  ) {
    const userId = req.user['sub'];
    return await this.aiService.createAiStory(createAiStoryDto, userId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('books')
  async createAiBook(
    @Req() req: any,
    @Body() createAiBookDto: CreateAiBookDto,
  ) {
    const userId = req.user['sub'];
    return await this.aiService.createAiBook(createAiBookDto, userId);
  }
}
