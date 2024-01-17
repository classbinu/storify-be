import { AiService } from './ai.service';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';

@ApiTags('Ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('langchain')
  async langchain(@Body() langchainDto: LangchainDto) {
    return await this.aiService.langchain(langchainDto);
  }
}
