import { Injectable } from '@nestjs/common';

import { Book } from './schema/book.schema';
import { BookHistory } from './schema/book-history.schema';
import { BookMongoRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { CreateBookHistoryDto } from './dto/create-book-history.dto';
import { NotiGateway } from 'src/noti/noti.gateway';
import { NotiService } from 'src/noti/noti.service';
import { StoragesService } from 'src/storages/storages.service';
// import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UtilsService } from 'src/utils/utils.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly bookRepository: BookMongoRepository,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
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

  async findBookByBookId(id: string): Promise<Book> {
    return this.bookRepository.findBookByBookId(id);
  }

  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
    writerId: string,
  ): Promise<Book> {
    return this.bookRepository.updateBook(id, updateBookDto, writerId);
  }

  async deleteBook(id: string, writerId: string): Promise<Book> {
    return this.bookRepository.deleteBook(id, writerId);
  }

  async addLike(userObjectId: string, bookId: string) {
    try {
      const result = await this.bookRepository.addLike(userObjectId, bookId);
      const authorBook = await this.bookRepository.findBookByBookId(bookId);
      const userInfo = await this.usersService.findById(userObjectId);

      // 알림 보내기
      const authorSocketId = this.notiGateway.getUserSocketId(
        authorBook.userId.toString(),
      );
      try {
        if (authorSocketId) {
          this.notiGateway.server.to(authorSocketId).emit('like', {
            bookId: bookId,
            message: `${userInfo.nickname}님이 (${authorBook.title})책을 좋아해요.`,
          });
          console.log('좋아요 누른 유저 :', userInfo.nickname);
          console.log('authorSocketId : ', authorSocketId);
        }
      } catch (error) {
        // 알림 실패한 경우만 알림 저장
        await this.notiService.create({
          senderId: userInfo.nickname,
          receiverId: authorBook.userId.toString(),
          message: `${userInfo.nickname}님이 (${authorBook.title})책을 좋아해요.`,
          service: 'Books',
        });
        console.log('소켓 통신 실패! 좋아요 누른 유저 :', userInfo.nickname);
      }
      return result;
    } catch (error) {
      throw new Error(`Like 추가 실패: ${error.message}`);
    }
  }

  async removeLike(userObjectId: string, bookId: string) {
    try {
      return await this.bookRepository.removeLike(userObjectId, bookId);
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
