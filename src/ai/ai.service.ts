import { BooksService } from 'src/books/books.service';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { CreateBookDto } from 'src/books/dto/create-book.dto';
import { Injectable } from '@nestjs/common';
// import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
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

  async langchain(langchainDto: LangchainDto, storyId, userId): Promise<any> {
    const chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo-1106',
      // modelName: 'gpt-4',
      temperature: 0.1,
    });

    const userMessage = langchainDto.message;
    const systemMessage = `
    #role
    You are a children's story writer.

    # directive
    Creates a story based on user input.

    # Constraints
    1. In Korean.
    1. The story must be created with at least 400 characters.
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
    1. Each prompt consists of at least 3 words. Like "[lovely_girl, orange_hair, cozy, warm, happy, under_the_tree, sunshie]"
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

    try {
      const imagePromprts = JSON.parse(arrayString);
      console.log(imagePromprts);
      this.createStorybook(storyArray, imagePromprts, storyId, userId);
    } catch (error) {
      console.log('Invalid JSON:', arrayString);
    }

    return res.content;
  }

  // 책을 만드는 함수
  async createStorybook(storyArray, imagePromprts, storyId, userId) {
    const negativePrompts =
      'bad art, ugly, deformed, watermark, duplicated, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, body out of frame, blurry, bad anatomy, blurred, grainy, signature, cut off, draft';

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
    // const bookBody = {};
    // results.forEach((url, index) => {
    //   bookBody[index + 1] = bookBody[index + 1] || {};

    //   bookBody[index + 1]['imgUrl'] = url;
    //   bookBody[index + 1]['text'] = storyArray[index];
    //   bookBody[index + 1]['imagePrompt'] = ['임시 이미지 프롬프트'];
    //   bookBody[index + 1]['ttsUrl'] = ['임시 TTS URL'];
    // });

    const bookBody = {};
    results.forEach((url, index) => {
      bookBody[index + 1] = {
        imgUrl: url,
        text: storyArray[index],
        imagePrompt: imagePromprts[index],
        ttsUrl: '',
      };
    });

    const createBookDto: CreateBookDto = {
      title: '테스트',
      body: bookBody,
      storyId: storyId,
      userId: userId,
    };

    // book 데이터 생성 코드 필요
    return await this.booksService.createBook(createBookDto);
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
