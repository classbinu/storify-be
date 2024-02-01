import { AiService } from './ai.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateAiStoryDto } from './dto/create-ai-story.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { UpdateAiBookDto } from './dto/update-ai-book.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateTtsDto } from './dto/create-tts.dto';
import { CreateAiBookDto } from './dto/create-ai-book.dto';
import { Base64Dto } from 'src/storages/dto/base64.dto';

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
  @Post('tts')
  async textToSpeech(@Req() req: any, @Body() createTtsDto: CreateTtsDto) {
    return await this.aiService.textToSpeech(createTtsDto);
  }

  // @UseGuards(AccessTokenGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: '❌ AI 책 이미지 업데이트(비가역적 변경)' })
  // @Patch('books/:id/:page/images')
  // async updateAiBooksImages(
  //   @Req() req: any,
  //   @Param('id') id: string,
  //   @Param('page') page: string,
  // ) {
  //   const userId = req.user['sub'];
  //   return await this.aiService.updateAiBooksImages(id, page, userId);
  // }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '해당 페이지의 이미지 프롬프트에 맞는 이미지 4장을 생성합니다.',
  })
  @Get('books/:id/:page/new-images')
  async generateNewBookImages(
    @Req() req: any,
    @Param('id') id: string,
    @Param('page') page: string,
  ) {
    return await this.aiService.generateNewBookImages(id, page);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch('books/:id/:page/new-images')
  async updateAiBookNewImage(
    @Req() req: any,
    @Body() base64Dto: Base64Dto,
    @Param('id') id: string,
    @Param('page') page: string,
  ) {
    const userId = req.user['sub'];
    return await this.aiService.updateAiBookNewImage(
      id,
      page,
      userId,
      base64Dto,
    );
  }
}
