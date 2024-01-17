import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  async langchain(langchainDto: LangchainDto): Promise<any> {
    const chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo-1106',
      temperature: 0.9,
    });

    const userMessage = langchainDto.message;
    const systemMessage = '당신은 동화작가입니다.';
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemMessage],
      ['user', '{input}'],
    ]);

    const chain = prompt.pipe(chatModel);
    const res = await chain.invoke({
      input: userMessage,
    });

    return res;
  }
}
