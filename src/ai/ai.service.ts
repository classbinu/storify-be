import { BooksService } from 'src/books/books.service';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { CreateBookDto } from 'src/books/dto/create-book.dto';
import { Injectable } from '@nestjs/common';
import { LangchainDto } from './dto/langchain.dto';
import { StableDiffusionDto } from './dto/stableDiffusion.dto';
import { StoragesService } from 'src/storages/storages.service';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private readonly storagesService: StoragesService,
    private readonly booksService: BooksService,
  ) {}

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
    1. In English.
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

  // 책을 만드는 함수
  async createStorybook(storyArray) {
    const negativePrompts =
      'bad art, ugly, deformed, watermark, duplicated, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, body out of frame, blurry, bad anatomy, blurred, grainy, signature, cut off, draft';

    // 삽화 생성 병렬 요청
    const promises = storyArray.map((prompts: string, index: number) => {
      return this.stableDiffusion({
        prompts,
        negativePrompts,
      }).then(async (buffer) => {
        const result = await this.storagesService.bufferUploadToS3(
          `storybook-${Date.now()}-${index}.png`,
          buffer,
          'png',
        );
        return result;
      });
    });

    // s3 업로드 결과가 배열에 순서대로 담김
    const results = await Promise.all(promises);

    // book body 생성
    const bookBody = {};
    results.forEach((url, index) => {
      bookBody[index + 1] = bookBody[index + 1] || {};

      bookBody[index + 1]['imgUrl'] = url;
      bookBody[index + 1]['text'] = storyArray[index];
    });

    const createBookDto = {
      title: '테스트',
      body: bookBody,
    };

    console.log(createBookDto);

    // book 데이터 생성 코드 필요
    return await this.booksService.createBook();
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
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }
}
