import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';
import { StableDiffusionDto } from './dto/stableDiffusion.dto';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  async uploadImageToS3(blob: Blob, index: number): Promise<any> {
    console.log(blob);
    console.log(index);
    return index;
  }

  async langchain(langchainDto: LangchainDto): Promise<any> {
    const chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo-1106',
      // modelName: 'gpt-4',
      temperature: 0.9,
    });

    const userMessage = langchainDto.message;
    const systemMessage = `
    #role
    You are a children's story writer.

    # directive
    Creates a fairy tale based on user input.

    # Constraints
    1. The fairy tale must be created with at least 400 characters.
    1. The fairy tale is created with at least four paragraphs separated by blank lines.
    `;
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemMessage],
      ['user', '{input}'],
    ]);

    const chain = prompt.pipe(chatModel);
    const res = await chain.invoke({
      input: userMessage,
    });

    const storyText = res.content.toString();
    const storyArray = storyText.split('\n\n');
    this.createStorybook(storyArray);
    return res.content;
  }

  async createStorybook(storyArray) {
    const negativePrompts =
      'bad art, ugly, deformed, watermark, duplicated, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, body out of frame, blurry, bad anatomy, blurred, grainy, signature, cut off, draft';

    const promises = storyArray.map((item, index) => {
      return this.stableDiffusion({
        prompts: item,
        negativePrompts,
      }).then((blob) => {
        this.uploadImageToS3(blob, index);
      });
    });

    const results = await Promise.all(promises);
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

    const theme = 'storybook';
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
    return res.blob();
  }
}
