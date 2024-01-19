import { BooksService } from 'src/books/books.service';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { CreateBookDto } from 'src/books/dto/create-book.dto';
import { Injectable } from '@nestjs/common';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
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
      temperature: 0.2,
    });

    const userMessage = langchainDto.message;
    const systemMessage = `
    #role
    You are a children's story writer.

    # directive
    Creates a story based on user input.

    # Constraints
    1. In Korean.
    1. The story must be created with at least 800 characters.
    1. The story is created with at least four paragraphs separated by blank lines.
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
    console.log(storyArray);

    // 삽화 프롬프트 생성
    const userMessage2 = storyArray;
    const systemMessage2 = `
    # directive
    1. In English
    1. Create ${storyArray.length} image prompts about people and landscapes creation to go with this story. 
    1. Each prompt consists of at least 10 words. Like "[lovely_girl, orange_hair, cozy, warm, happy, under_the_tree, sunshie]"
    1. Each prompt is returned in the form of an array, and the array has ${storyArray.length} elements.
    1. Return the prompts as a JSON array, with each prompt consisting of descriptive elements in a sub-array.
    1. People's names are not used and only objective situations are described.
    1. Characters such as must start with '[' and end with ']'.
    `;

    const prompt2 = ChatPromptTemplate.fromMessages([
      ['system', systemMessage2],
      ['user', '{input}'],
    ]);

    const chain2 = prompt2.pipe(chatModel);
    const res2 = await chain2.invoke({
      input: storyText,
    });

    // const imageText = res2.content.toString();
    // const imageArray = imageText.split('\n\n');
    const storyArray2 = res2.content.toString();

    const startIndex = storyArray2.indexOf('[');
    const endIndex = storyArray2.lastIndexOf(']');

    const arrayString = storyArray2.substring(startIndex, endIndex + 1);
    console.log(arrayString);

    const imagePromprts = JSON.parse(arrayString);
    console.log(imagePromprts);

    this.createStorybook(storyArray, imagePromprts);
    return res.content;
  }

  // 책을 만드는 함수
  async createStorybook(storyArray, imagePromprts) {
    const negativePrompts =
      'worst quality, normal quality, low quality, low res, blurry, text, watermark, logo, banner, extra digits, cropped, jpeg artifacts, signature, username, error, sketch ,duplicate, ugly, monochrome, horror, geometry, mutation, disgusting, bad anatomy, bad hands, three hands, three legs, bad arms, missing legs, missing arms, poorly drawn face, bad face, fused face, cloned face, worst face, three crus, extra crus, fused crus, worst feet, three feet, fused feet, fused thigh, three thigh, fused thigh, extra thigh, worst thigh, missing fingers, extra fingers, ugly fingers, long fingers, horn, realistic photo, extra eyes, huge eyes, 2girl, amputation, disconnected limbs';

    // 삽화 생성 병렬 요청
    const promises = imagePromprts.map((prompts: string, index: number) => {
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
    // return await this.booksService.createBook();
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
      inputs: `${TRIGGER_WORDS} detailed, best_quality, ${prompts}, ${LORA}`,
      // inputs: prompts,
      parameters: {
        negative_prompt: negativePrompts,
        min_length: false,
        max_length: false,
        top_k: false,
        top_p: false,
        temperature: 0,
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
