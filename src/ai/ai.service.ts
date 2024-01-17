import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';
import { StableDiffusionDto } from './dto/stableDiffusion.dto';

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
    const systemMessage = `
      당신은 동화작가입니다. 
      당신이 생성하는 동화는 '기승전결'의 4문단으로 구성됩니다.
      폭력적이거나 성적인 내용이라면 다른 응답은 하지 않고 false를 반환합니다.
    `;
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemMessage],
      ['user', '{input}'],
    ]);

    const chain = prompt.pipe(chatModel);
    const res = await chain.invoke({
      input: userMessage,
    });

    return res.content;
  }

  async stableDiffusion(stabldDiffusionDto: StableDiffusionDto): Promise<any> {
    const THEME_LIST = {
      storybook: {
        url: 'https://api-inference.huggingface.co/models/artificialguybr/StoryBookRedmond-V2',
        trigger: 'KidsRedmAF, Kids Book,',
        lora: '<lora:StorybookRedmondV2-KidsBook-KidsRedmAF:1>',
      },
      ghibli: {
        url: 'https://api-inference.huggingface.co/models/artificialguybr/StudioGhibli.Redmond-V2',
        trigger: 'Studio Ghibli, StdGBRedmAF,',
        lora: '<lora:StdGBRedmAF21Config4WithTEV2:1>',
      },
      cartoon: {
        url: 'https://api-inference.huggingface.co/models/artificialguybr/CuteCartoonRedmond-V2',
        trigger: 'CuteCartoonAF, Cute Cartoon,',
        lora: '<lora:CuteCartoonRedmond-CuteCartoon-CuteCartoonAF:1>',
      },
    };

    const theme = 'cartoon';
    const prompts = stabldDiffusionDto.prompts;
    const negativePrompts = stabldDiffusionDto.negativePrompts;

    const API_URL = THEME_LIST[theme].url;
    const TRIGGER_WORDS = THEME_LIST[theme].trigger;
    const LORA = THEME_LIST[theme].lora;
    const HUGGINFACE_API_KEY =
      this.configService.get<string>('HUGGINFACE_API_KEY');

    const headers = {
      Authorization: `Bearer ${HUGGINFACE_API_KEY}`,
    };

    const payload = {
      inputs: `${TRIGGER_WORDS} ${prompts}, ${LORA}`,
      parameters: {
        negative_prompt: negativePrompts,
        min_length: false,
        max_length: false,
        top_k: false,
        top_p: false,
        temperature: 1.0,
        repetition_penalty: false,
        max_time: false,
      },
      options: {
        use_cache: false,
        wait_for_model: false,
      },
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return base64;
  }
}
