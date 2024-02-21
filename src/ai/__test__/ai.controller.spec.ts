import { Test, TestingModule } from '@nestjs/testing';

import { AiController } from '../ai.controller';
import { AiService } from '../ai.service';

describe('AiController', () => {
  let controller: AiController;
  let mockAiService: Partial<AiService>;

  beforeEach(async () => {
    mockAiService = {
      createAiStory: jest.fn(() =>
        Promise.resolve({
          content: 'mocked story content',
          story: 'mocked story object',
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a story', async () => {
    const req = { user: { sub: '1234' } };
    const createAiStoryDto = { message: 'mocked message' };

    const story = await controller.createAiStory(req, createAiStoryDto);
    expect(story).toEqual({
      content: 'mocked story content',
      story: 'mocked story object',
    });
  });
});
