import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';
import { StableDiffusionDto } from './dto/stableDiffusion.dto';

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
}
