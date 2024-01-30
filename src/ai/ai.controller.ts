import { AiService } from './ai.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateAiStoryDto } from './dto/create-ai-story.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { CreateAiBookDto } from './dto/create-ai-book.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateTtsDto } from './dto/create-tts.dto';

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
  @Post('question')
  async createQuestion(
    @Req() req: any,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return await this.aiService.createQuestion(createQuestionDto);
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('books/:id/:page/images')
  async updateAiBooksImages(
    @Req() req: any,
    @Param('id') id: string,
    @Param('page') page: string,
  ) {
    const userId = req.user['sub'];
    return await this.aiService.updateAiBooksImages(id, page, userId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('tts')
  async careteTTS(@Req() req: any, @Body() createTtsDto: CreateTtsDto) {
    return await this.aiService.createTTS(createTtsDto);
  }
}
