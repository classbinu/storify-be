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
import { Polly } from 'aws-sdk';
// import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { StoragesService } from 'src/storages/storages.service';
import { StoriesService } from 'src/stories/stories.service';
import { UpdateBookDto } from 'src/books/dto/update-book.dto';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private readonly storagesService: StoragesService,
    private readonly storiesService: StoriesService,
    private readonly booksService: BooksService,
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
    modelName: string = 'gpt-3.5-turbo-1106',
  ) {
    const chatModel = new ChatOpenAI({
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: modelName,
      // modelName: 'gpt-4-1106-preview',
      temperature: 0.9,
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
    const systemMessage = `
    # role
    You are a teacher who asks good questions to help children write better.

    # directive
    1. Create a question that encourages the user to write a more specific story about the story they entered.
    1. The user will not be asked again.
    1. You don't respond to users, you only create ONE question.
    1. Use simple expressions that children can understand.

    # Constraints
    1. In Korean.
    1. 예시의 질문을 그대로 하지 않고, 사용자의 입력에 어울리는 후속 질문을 한다.
    1. 인물, 사건, 시간적 배경, 공간적 배경을 묻는 질문을 한다.
    1. 이미 사용하자 대답한 내용에 관해서는 질문하지 않는다.

    # 예시
    1. 친구와 놀았다니 재미있었겠다!🥰 친구와 무슨 놀이를 했는지 자세히 알려 줄래?
    1. 정말 맛있었겠다!🤗 음식의 맛, 냄새가 어땠어?
    1. 사탕은 정말 달콤하지!🍭 누구와 사탕을 먹었어?
    `;
    const userMessage = createQuestionDto.message;
    const createdQuestion = await this.generateAiText(
      systemMessage,
      userMessage,
      // 'ft:gpt-3.5-turbo-1106:personal::8mZuEDOU',
    );

    return createdQuestion;
  }

  // LLM으로 이야기를 생성하는 함수
  async createAiStory(createAiStoryDto: CreateAiStoryDto, userId: string) {
    const systemMessage = `
    # role
    You are a children's story writer.

    # directive
    1. You have to Creates a creative story based on user input.
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

  // LLM으로 삽화 프롬프트를 생성하는 함수
  async createImagePrompts(storyText: string) {
    const storyArray = storyText.split('\n\n');

    const systemMessage = `
    # directive
    1. In English
    1. Create ${storyArray.length - 1} image prompts about people and landscapes creation to go with this story. 
    1. Each prompt consists of at least 3 words. Like "[lovely_girl, orange_hair, cozy, warm, happy, under_the_tree, sunshie]"
    1. Each prompt is returned in the form of an array, and the array has ${storyArray.length - 1} elements.
    1. Return the prompts as a JSON array, with each prompt consisting of descriptive elements in a sub-array.
    1. People's names are not used and only objective situations are described.
    1. Each prompt must start with '[' and end with ']'.
    `;
    const userMessage = storyText;
    const createdImagePrompts = await this.generateAiText(
      systemMessage,
      userMessage,
    );

    const createdImagePromptsString = createdImagePrompts.toString();
    const startIndex = createdImagePromptsString.indexOf('[');
    const endIndex = createdImagePromptsString.lastIndexOf(']');
    const createdImagePromptsSubstring = createdImagePromptsString.substring(
      startIndex,
      endIndex + 1,
    );

    try {
      const createdImagePromptsArray = JSON.parse(createdImagePromptsSubstring);
      return createdImagePromptsArray;
    } catch (error) {
      console.error('Error parsing JSON:', error);
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
    // 삽화 생성 병렬 요청
    const uploadPromises = imagePrompts.map(
      async (prompt: string, i: number) => {
        const buffer = await this.stableDiffusion(prompt, imageStyle);

        const s3Url = await this.storagesService.bufferUploadToS3(
          `${storyId}-${Date.now()}-${i + 1}.png`,
          buffer,
          'png',
        );

        return s3Url;
      },
    );

    const imageUrlArray = await Promise.all(uploadPromises);

    // 책 데이터 생성
    const bookBody = {};
    imageUrlArray.forEach((url, index) => {
      bookBody[index + 1] = {
        imageUrl: url,
        text: storyArray[index],
        imagePrompt: imagePrompts[index].join(', '),
        ttsUrl: '',
      };
    });

    const createBookDto: CreateBookDto = {
      title,
      coverUrl: bookBody[1].imageUrl,
      body: bookBody,
      storyId: storyId,
      userId: userId,
    };

    console.log(createBookDto);

    // book 데이터 생성 코드 필요
    return await this.booksService.createBook(createBookDto);
  }

  // 기존 삽화를 재생성하는 함수
  async updateAiBooksImages(id: string, page: string, userId: string) {
    const book = await this.booksService.findBookById(id);
    if (!book) {
      throw new Error('Book not found');
    }

    if (book.userId.toString() !== userId) {
      throw new Error('User not authorized');
    }

    const imageStyle = book.imageStyle;
    const bookBody = book.body;
    console.log(bookBody.get(page));
    const imagePrompt = bookBody.get(page).imagePrompt;

    const buffer = await this.stableDiffusion(imagePrompt, imageStyle);
    const s3Url = await this.storagesService.bufferUploadToS3(
      `${book.storyId}-${Date.now()}-${page}.png`,
      buffer,
      'png',
    );

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

  async createTTS(createTtsDto: CreateTtsDto) {
    const message = createTtsDto.message;

    const polly = new Polly({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_POLLY_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>(
          'AWS_POLLY_SECRET_ACCESS_KEY',
        ),
      },
    });

    const params = {
      Text: message,
      OutputFormat: 'mp3',
      VoiceId: 'Seoyeon',
    };
    try {
      const result = await polly.synthesizeSpeech(params).promise();
      return result.AudioStream;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
