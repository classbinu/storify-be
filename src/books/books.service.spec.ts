import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BookMongoRepository } from './books.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './schema/book.schema';
import { Types } from 'mongoose';

describe('BooksService', () => {
  let service: BooksService;
  let repository: BookMongoRepository;
  const mockBook: any = {
    title: 'Test Book',
    coverUrl: 'http://test.com/cover.jpg',
    body: {
      testKey: {
        text: 'Test Text',
        imagePrompt: 'Test Image Prompt',
        imageUrl: 'http://test.com/image.jpg',
        ttsUrl: 'http://test.com/tts.mp3',
      },
    },
    userId: new Types.ObjectId(),
    storyId: new Types.ObjectId(),
  };

  const mockCreateBookDto: any = {
    title: 'Test Book',
    coverUrl: 'http://test.com/cover.jpg',
    body: {
      testKey: {
        text: 'Test Text',
        imagePrompt: 'Test Image Prompt',
        imageUrl: 'http://test.com/image.jpg',
        ttsUrl: 'http://test.com/tts.mp3',
      },
    },
    userId: new Types.ObjectId(),
    storyId: new Types.ObjectId(),
  };

  const mockBookHistory: any = {
    userId: new Types.ObjectId(),
    bookId: new Types.ObjectId(),
    lastPage: 0,
    rate: 0,
    count: 0,
  };

  const mockCreateBookHistoryDto: any = {
    userId: new Types.ObjectId(),
    bookId: new Types.ObjectId(),
    lastPage: 0,
    rate: 0,
    count: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        BookMongoRepository,
        {
          provide: getModelToken(Book.name),
          useValue: {
            createBook: jest.fn().mockResolvedValue(mockBook),
            createOrUpdateBookHistory: jest
              .fn()
              .mockResolvedValue(mockBookHistory),
            updateBookHistory: jest.fn().mockResolvedValue(mockBookHistory),
            findAllBooks: jest.fn().mockResolvedValue([mockBook]),
            findBookById: jest.fn().mockResolvedValue(mockBook),
            deleteBook: jest.fn().mockResolvedValue(mockBook),
          },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<BookMongoRepository>(BookMongoRepository);
  });

  it('should create a book', async () => {
    expect(await service.createBook(mockCreateBookDto)).toBe(mockBook);
    expect(repository.createBook).toHaveBeenCalledWith(mockCreateBookDto);
  });

  it('should create or update a book history', async () => {
    expect(
      await service.createOrUpdateBookHistory(mockCreateBookHistoryDto),
    ).toBe(mockBookHistory);
    expect(repository.createOrUpdateBookHistory).toHaveBeenCalledWith(
      mockCreateBookHistoryDto,
    );
  });
});
