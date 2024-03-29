import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

import { Base64Dto } from 'src/storages/dto/base64.dto';
import { BooksService } from 'src/books/books.service';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConfigService } from '@nestjs/config';
import { CreateAiBookDto } from './dto/create-ai-book.dto';
import { CreateAiStoryDto } from './dto/create-ai-story.dto';
import { CreateBookDto } from 'src/books/dto/create-book.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateTtsDto } from './dto/create-tts.dto';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
// import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { StoragesService } from 'src/storages/storages.service';
import { StoriesService } from 'src/stories/stories.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { UpdateBookDto } from 'src/books/dto/update-book.dto';
import { UserMongoRepository } from 'src/users/users.repository';
import fallbackImages from './fallbackImages';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private readonly storagesService: StoragesService,
    private readonly storiesService: StoriesService,
    private readonly booksService: BooksService,
    private readonly telegramService: TelegramService,
    private readonly userRepository: UserMongoRepository,
  ) {}

  // 프롬프트를 바탕으로 삽화를 생성하는 함수
  async stableDiffusion(
    prompt: string,
    imageStyle: string = 'cartoon',
  ): Promise<any> {
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

    const negativePrompt =
      'bad art, ugly, deformed, watermark, duplicated, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, poorly drawn eyes, out of frame, extra limbs, disfigured, body out of frame, blurry, bad anatomy, blurred, grainy, signature, cut off, draft';

    const API_URL = THEME_LIST[imageStyle].url;
    const TRIGGER_WORDS = THEME_LIST[imageStyle].trigger;
    const LORA = THEME_LIST[imageStyle].lora;
    const HUGGINFACE_API_KEY =
      this.configService.get<string>('HUGGINFACE_API_KEY');

    const headers = {
      Authorization: `Bearer ${HUGGINFACE_API_KEY}`,
    };

    const payload = {
      inputs: `${TRIGGER_WORDS} detailed, best_quality, ${prompt}, ${LORA}`,
      // inputs: prompt,
      parameters: {
        negative_prompt: negativePrompt,
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

  // LLM으로 텍스트를 생성하는 베이스 함수
  async generateAiText(
    systemMessage: string,
    userMessage: string,
    modelName: string = 'gpt-3.5-turbo-0125',
    temperature: number = 0.2,
  ) {
    const chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: modelName,
      // modelName: 'gpt-4-1106-preview',
      temperature: temperature,
    });

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

  // LLM으로 이야기를 쓸 수 있는 질문을 유도하는 함수
  async createQuestion(createQuestionDto: CreateQuestionDto) {
    // const systemMessage = `
    // # role
    // 당신은 아이들이 글을 더 잘 쓸 수 있도록 질문을 유도하는 선생님이다..

    // # directive
    // 1. 사용자의 입력에 더 자세한 내용을 유도하는 짧은 질문을 한다.
    // 1. 당신은 사용자에게 다시 질문하지 않는다.
    // 1. 당신은 사용자의 질문에 대답하지 않고, 오직 사용자의 입력에 대한 질문만 한다.
    // 1. 어린이들이 이해할 수 있는 간단한 표현을 사용해라..

    // # Constraints
    // 1. 한국어로 대답한다.
    // 1. 예시의 질문을 그대로 하지 않고, 사용자의 입력에 어울리는 후속 질문을 한다.
    // 1. 인물, 사건, 시간적 배경, 공간적 배경을 묻는 질문을 한다.
    // 1. 이미 사용자가 대답한 내용에 관해서는 질문하지 않는다.

    // # 예시
    // 1. 친구와 놀았다니 재미있었겠다! 친구와 무슨 놀이를 했는지 자세히 알려 줄래?
    // 1. 정말 맛있었겠다! 음식의 맛, 냄새가 어땠어?
    // 1. 사탕은 정말 달콤하지! 누구와 사탕을 먹었어?
    // 1. 친구는 소중하지. 친구의 이름과 모습을 설명해 줄래?
    // 1. 여행은 정말 좋지! 여행지의 이름과 모습을 설명해 줄래?
    // `;
    const systemMessage =
      '사용자의 입력에 더 자세한 내용을 유도하는 짧은 질문을 한다. 인물, 사건, 시간적 배경, 공간적 배경을 묻는 질문을 한다.';
    const userMessage = createQuestionDto.message;
    const createdQuestion = await this.generateAiText(
      systemMessage,
      userMessage,
      // 'ft:gpt-3.5-turbo-1106:personal::8smTWBNU',
      'ft:gpt-3.5-turbo-1106:personal::8tppcEV0',
      0,
    );

    return createdQuestion;
  }

  // LLM으로 이야기를 생성하는 함수
  async createAiStory(
    createAiStoryDto: CreateAiStoryDto,
    userId: string,
  ): Promise<any> {
    const systemMessage = `
    # role
    You are a children's story writer.

    # directive
    1. You have to Creates a creative story based on user input.
    1. It creates an exciting story by adding fiction to the user's input.
    1. The user will not be asked again.
    1. You don't respond to users, you only create stories.

    # Constraints
    1. In Korean.
    1. '제목: [이야기의 제목]' 형식으로 시작한다.
    1. 제목은 한글로 12자 이하이다.
    1. The story should have the following structure: Introduction, Development, Turn, and Conclusion.
    1. The story is created with at least 4 paragraphs separated by double blank lines.
    1. Each paragraph must be less than 100 characters.
    1. The story must be created with at least 400 characters.
    `;
    const userMessage = createAiStoryDto.message;
    const createdAiStory = await this.generateAiText(
      systemMessage,
      userMessage,
      // 'ft:gpt-3.5-turbo-1106:personal::8mbwvHLB',
    );

    const createdStory = await this.storiesService.createStory({
      userId,
      message: createAiStoryDto.message,
    });

    if (!createdStory) {
      throw new Error('Story not created');
    }

    return { content: createdAiStory, story: createdStory };
  }

  // // LLM으로 삽화 프롬프트를 생성하는 함수
  // async createImagePrompts(storyText: string) {
  //   const storyArray = storyText.split('\n\n');

  //   const systemMessage = `
  //   # directive
  //   1. In English
  //   1. Create ${storyArray.length - 1} image prompts about people and landscapes creation to go with this story.
  //   1. Each prompt consists of at least 3 words. Like "[lovely_girl, orange_hair, cozy, warm, happy, under_the_tree, sunshie]"
  //   1. Each prompt is returned in the form of an array, and the array has ${storyArray.length - 1} elements.
  //   1. Return the prompts as a JSON array, with each prompt consisting of descriptive elements in a sub-array.
  //   1. People's names are not used and only objective situations are described.
  //   1. Each prompt must start with '[' and end with ']'.
  //   `;
  //   const userMessage = storyText;
  //   const createdImagePrompts = await this.generateAiText(
  //     systemMessage,
  //     userMessage,
  //   );

  //   const createdImagePromptsString = createdImagePrompts.toString();
  //   const startIndex = createdImagePromptsString.indexOf('[');
  //   const endIndex = createdImagePromptsString.lastIndexOf(']');
  //   const createdImagePromptsSubstring = createdImagePromptsString.substring(
  //     startIndex,
  //     endIndex + 1,
  //   );

  //   try {
  //     const createdImagePromptsArray = JSON.parse(createdImagePromptsSubstring);
  //     return createdImagePromptsArray;
  //   } catch (error) {
  //     return null;
  //   }
  // }

  async createImagePrompts(storyText: string) {
    const storyArray = storyText
      .split('\n\n')
      .filter((paragraph) => paragraph.trim() !== '')
      .slice(1);

    // 문단별로 프롬프트를 생성하는 비동기 작업 배열 생성
    const promptPromises = storyArray.map((paragraph, index) => {
      const systemMessage = `
        # directive
        1. In English
        1. Create 1 image prompt about people and landscapes creation to go with this paragraph. 
        1. The prompt consists of at least 5 words. Like "lovely_girl, orange_hair, cozy, warm, happy, under_the_tree, sunshine"
        1. People's names are not used and only objective situations are described.
        1. Prompts are returned as a list of words separated by commas.
      `;
      const userMessage = paragraph;
      return this.generateAiText(systemMessage, userMessage).then(
        (createdImagePrompt) => {
          try {
            return createdImagePrompt;
          } catch (error) {
            console.error(
              `Error parsing prompt for paragraph ${index}:`,
              error,
            );
            return null; // 파싱 실패시 null 반환
          }
        },
      );
    });

    // 모든 프롬프트 생성 작업이 완료될 때까지 기다림
    try {
      const createdImagePromptsArray = await Promise.all(promptPromises);
      return createdImagePromptsArray.filter((prompt) => prompt !== null); // null이 아닌 프롬프트만 반환
    } catch (error) {
      console.error('Error generating image prompts:', error);
      return null;
    }
  }

  // AI 책을 생성하는 함수
  async createAiBook(createAiBookDto: CreateAiBookDto, userId: string) {
    const storyText = createAiBookDto.aiStory;
    const storyId = createAiBookDto.storyId;
    const storyArray = storyText.split('\n\n');
    const title = storyArray.shift().replace('제목: ', '').replace(/"/g, '');

    const imagePrompts = await this.createImagePrompts(storyText);
    const imageStyle = createAiBookDto.imageStyle;
    // 삽화 생성 병렬 요청(Promise 경쟁 없음)
    // const uploadPromises = imagePrompts.map(
    //   async (prompt: string, i: number) => {
    //     const buffer = await this.stableDiffusion(prompt, imageStyle);

    //     const s3Url = await this.storagesService.bufferUploadToS3(
    //       `${storyId}-${Date.now()}-${i + 1}.png`,
    //       buffer,
    //       'png',
    //     );

    //     return s3Url;
    //   },
    // );

    // 삽화 생성 병렬 요청(Promise 경쟁 있음)
    const fallbackImageUrl = [
      'https://s3.ap-northeast-2.amazonaws.com/storify/65d2e2fc2268651774976ed6-1708319502322-1.png',
      'https://s3.ap-northeast-2.amazonaws.com/storify/65d2e2fc2268651774976ed6-1708319498224-2.png',
      'https://s3.ap-northeast-2.amazonaws.com/storify/65d2e2fc2268651774976ed6-1708319503849-3.png',
      'https://s3.ap-northeast-2.amazonaws.com/storify/65d2e2fc2268651774976ed6-1708319497013-4.png',
    ];

    const uploadPromises = imagePrompts.map(
      async (prompt: string, i: number) => {
        // 이미지 생성 요청과 타임아웃 프로미스를 경쟁시킴
        const bufferPromise = this.stableDiffusion(prompt, imageStyle).then(
          (buffer) => {
            return this.storagesService.bufferUploadToS3(
              `${storyId}-${Date.now()}-${i + 1}.png`,
              buffer,
              'png',
            );
          },
        );

        // 20초 후에 거부되는 프로미스 생성
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(
            () => resolve(fallbackImageUrl[i % fallbackImageUrl.length]),
            20000,
          ),
        );

        // 두 프로미스 중 하나가 먼저 완료되면 해당 결과 사용
        return Promise.race([bufferPromise, timeoutPromise]);
      },
    );

    const imageUrlArray = await Promise.all(uploadPromises);

    // 책 데이터 생성
    const bookBody = {};
    imageUrlArray.forEach((url, index) => {
      bookBody[index + 1] = {
        imageUrl: url,
        text: storyArray[index],
        imagePrompt: imagePrompts[index],
        ttsUrl: '',
      };
    });

    const createBookDto: CreateBookDto = {
      title,
      coverUrl: bookBody[1].imageUrl.replace(
        'storify/',
        'storify-resized/resized-',
      ),
      body: bookBody,
      storyId: storyId,
      userId: userId,
    };

    console.log(`[Create Book] ${createBookDto.title}`);
    const user = await this.userRepository.findById(userId);

    this.telegramService.sendMessage({
      message: `[AI 동화 생성]\ntitle: ${title}\nuserNickname: ${user.nickname}`,
    });

    // book 데이터 생성 코드 필요
    return await this.booksService.createBook(createBookDto);
  }

  // 삽화를 업데이트하는 함수
  async updateAiBooksImages(id: string, page: string, userId: string) {
    const book = await this.booksService.findBookByBookId(id);
    if (!book) {
      throw new Error('Book not found');
    }

    if (book.userId.toString() !== userId) {
      throw new Error('User not authorized');
    }

    const imageStyle = book.imageStyle;
    const bookBody = book.body;
    const imagePrompt = bookBody.get(page).imagePrompt;

    const buffer = await this.stableDiffusion(imagePrompt, imageStyle);
    const s3Url = await this.storagesService.bufferUploadToS3(
      `${book.storyId}-${Date.now()}-${page}.png`,
      buffer,
      'png',
    );

    bookBody.get(page).imageUrl = s3Url;

    // 변경한 이미지가 1페이지면 표지도 변경
    if (page === '1') {
      book.coverUrl = s3Url.replace('storify/', 'storify-resized/resized-');
    }

    const updateBookDto: UpdateBookDto = {
      title: book.title,
      coverUrl: book.coverUrl,
      body: Object.fromEntries(bookBody),
    };

    return await this.booksService.updateBook(id, updateBookDto, userId);
  }

  // 텍스트를 음성으로 변환하는 함수
  async textToSpeech(createTtsDto: CreateTtsDto) {
    const message = createTtsDto.message;

    const client = new PollyClient({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });

    const params = {
      OutputFormat: 'mp3' as const,
      Text: message,
      TextType: 'text' as const,
      Engine: 'neural' as const,
      VoiceId: 'Seoyeon' as const,
    };

    const command = new SynthesizeSpeechCommand(params);

    try {
      const data = await client.send(command);
      // 스트림을 버퍼로 변환
      const audioStream = data.AudioStream as Readable;
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
      }
      const audioBuffer = Buffer.concat(chunks);

      // 버퍼를 base64 문자열로 인코딩
      const base64Audio = audioBuffer.toString('base64');
      return base64Audio;
    } catch (error) {
      return null;
    }
  }

  // 4장의 교제 후보 삽화를 생성하는 함수
  async generateNewBookImages(id: string, page: string): Promise<string[]> {
    const book = await this.booksService.findBookByBookId(id);
    const prompt = book.body.get(page).imagePrompt;
    const imageStyle = book.imageStyle || 'cartoon';
    const imagePromises = [];

    // Promise 경쟁 없이 이미지 생성
    // for (let i = 0; i < 4; i++) {
    //   imagePromises.push(this.stableDiffusion(prompt, imageStyle));
    // }

    // const buffers = await Promise.all(imagePromises);
    // const base64Images = buffers.map((buffer) => buffer.toString('base64'));
    // return base64Images;

    // Promise 경쟁을 통해 이미지 생성
    const fallbackBuffers = fallbackImages;
    for (let i = 0; i < 4; i++) {
      const bufferPromise = this.stableDiffusion(prompt, imageStyle);

      // 20초 후에 타임아웃 처리하는 프로미스
      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve(fallbackBuffers[i]), 20000),
      );

      imagePromises.push(Promise.race([bufferPromise, timeoutPromise]));
    }

    const buffers = await Promise.all(imagePromises);
    const base64Images = buffers.map((buffer) => buffer.toString('base64'));
    return base64Images;
  }

  // Base64 이미지로 동화 특정 페이지 삽화를 업데이트하는 함수
  async updateAiBookNewImage(
    id: string,
    page: string,
    userId: string,
    base64Dto: Base64Dto,
  ) {
    const book = await this.booksService.findBookByBookId(id);
    if (!book) {
      throw new Error('Book not found');
    }

    if (book.userId._id.toString() !== userId) {
      throw new Error('User not authorized');
    }

    const s3Url = await this.storagesService.fileUploadToS3ByBase64(base64Dto);

    const bookBody = book.body;
    bookBody.get(page).imageUrl = s3Url;

    // 1페이지면 표지도 연동(임시)
    if (page === '1') {
      book.coverUrl = s3Url;
    }

    const updateBookDto: UpdateBookDto = {
      title: book.title,
      coverUrl: book.coverUrl,
      body: Object.fromEntries(bookBody),
    };

    return await this.booksService.updateBook(id, updateBookDto, userId);
  }
}
