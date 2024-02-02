import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Book } from './schema/book.schema';
import { BookHistory } from './schema/book-history.schema';
import { BookMongoRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateBookHistoryDto } from './dto/create-book-history.dto';
import { StoragesService } from 'src/storages/storages.service';
// import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UtilsService } from 'src/utils/utils.service';
import { NotiGateway } from 'src/noti/noti.gateway';
import { NotiService } from 'src/noti/noti.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly bookRepository: BookMongoRepository,
    private readonly utilsService: UtilsService,
    private readonly storagesService: StoragesService,
    private readonly notiGateway: NotiGateway,
    private readonly notiService: NotiService,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    try {
      return await this.bookRepository.createBook(createBookDto);
    } catch (error) {
      throw new Error(`책 저장 실패: ${error.message}`);
    }
  }

  async createOrUpdateBookHistory(
    createBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    const existingHistory =
      await this.bookRepository.findBookHistoryByBookIdAndUserId(
        createBookHistoryDto.bookId,
        createBookHistoryDto.userId,
      );

    if (existingHistory) {
      return this.bookRepository.updateBookHistory(
        createBookHistoryDto.bookId,
        createBookHistoryDto,
      );
    }

    return this.bookRepository.createBookHistory(createBookHistoryDto);
  }

  async saveImage(file: Express.Multer.File) {
    try {
      return await this.imageUpload(file);
    } catch (error) {
      throw new Error(`이미지 저장 실패: ${error.message}`);
    }
  }

  async imageUpload(file: Express.Multer.File) {
    const imageName = this.utilsService.getUUID();
    const ext = file.originalname.split('.').pop();

    const imageUrl = await this.storagesService.imageUploadToS3(
      `${imageName}.${ext}`,
      file,
      ext,
    );

    return { imageUrl };
  }

  async findAllBooks(
    query: any,
    page: number,
    limit: number,
  ): Promise<{ total: number; books: Book[] }> {
    return this.bookRepository.findAllBooks(query, page, limit);
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookRepository.findBookById(id);
  }

  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
    writerId: string,
  ): Promise<Book> {
    try {
      const book = await this.bookRepository.findBookById(id);

      if (book.userId.toString() !== writerId) {
        throw new UnauthorizedException();
      }

      return this.bookRepository.updateBook(id, updateBookDto, writerId);
    } catch (error) {
      throw new Error(`책 업데이트 실패: ${error.message}`);
    }
  }

  async deleteBook(id: string, writerId: string): Promise<Book> {
    const book = await this.bookRepository.findBookById(id);

    if (book.userId.toString() !== writerId) {
      throw new UnauthorizedException();
    }

    return this.bookRepository.deleteBook(id, writerId);
  }

  async addLike(userId: string, bookId: string) {
    try {
      const result = await this.bookRepository.addLike(userId, bookId);

      // 책을 쓴 유저의 아이디를 가져옵니다.
      const authorId = (await this.bookRepository.findBookById(bookId)).userId;

      // 알림 보내기
      const userSocketId = this.notiGateway.getUserSocketId(
        authorId.toString(),
      );
      if (userSocketId) {
        this.notiGateway.server.to(userSocketId).emit('like', {
          bookId: bookId,
        });
      }

      // 알림 저장
      await this.notiService.create({
        senderId: userId,
        receiverId: authorId.toString(),
        message: `${userId}가 당신의 책(${bookId})에 좋아요를 추가했습니다.`,
        service: 'Books',
      });

      return result;
    } catch (error) {
      throw new Error(`Like 추가 실패: ${error.message}`);
    }
  }

  async removeLike(userId: string, bookId: string) {
    try {
      return await this.bookRepository.removeLike(userId, bookId);
    } catch (error) {
      throw new Error(`Like 제거 실패: ${error.message}`);
    }
  }

  async getLikedBooks(userId: string) {
    try {
      return await this.bookRepository.getLikedBooks(userId);
    } catch (error) {
      throw new Error(`좋아요한 책 목록 조회 실패: ${error.message}`);
    }
  }

  async addDislike(userId: string, bookId: string) {
    try {
      return await this.bookRepository.addDislike(userId, bookId);
    } catch (error) {
      throw new Error(`Dislike 추가 실패: ${error.message}`);
    }
  }

  async removeDislike(userId: string, bookId: string) {
    try {
      return await this.bookRepository.removeDislike(userId, bookId);
    } catch (error) {
      throw new Error(`Dislike 제거 실패: ${error.message}`);
    }
  }
}
