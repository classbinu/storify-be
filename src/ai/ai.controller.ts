import { AiService } from './ai.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';
import { StableDiffusionDto } from './dto/stableDiffusion.dto';
import { CreateAiStoryDto } from './dto/create-ai-story.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('Ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('langchain')
  async langchain(
    @Body() langchainDto: LangchainDto,
    @Body('storyId') storyId: string,
    @Body('userId') userId: string,
  ) {
    return await this.aiService.langchain(langchainDto, storyId, userId);
  }

  @Post('stablediffusion')
  async stableDiffusion(@Body() stabldDiffusionDto: StableDiffusionDto) {
    return await this.aiService.stableDiffusion(stabldDiffusionDto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post('createAiStory')
  async createAiStory(
    @Req() req: any,
    @Body() createAiStoryDto: CreateAiStoryDto,
  ) {
    const userId = req.user['sub'];
    return await this.aiService.createAiStory(createAiStoryDto, userId);
  }
}
