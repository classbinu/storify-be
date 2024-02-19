import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './schema/book.schema';
import { BookHistory, BookHistoryDocument } from './schema/book-history.schema';
import { Model, Types } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookHistoryDto } from './dto/create-book-history.dto';

@Injectable()
export class BookMongoRepository {
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<BookDocument>,
    @InjectModel(BookHistory.name)
    private bookHistoryModel: Model<BookHistoryDocument>,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    try {
      const createdBook = new this.bookModel(createBookDto);
      return await createdBook.save();
    } catch (error) {
      Logger.error(`createBook 실패: ${error.message}`);
      throw new Error('책 생성에 실패했습니다. 다시 시도해 주세요.');
    }
  }

  async createBookHistory(
    createBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    try {
      const createdBookHistory = new this.bookHistoryModel(
        createBookHistoryDto,
      );
      return await createdBookHistory.save();
    } catch (error) {
      Logger.error(`createBookHistory 실패: ${error.message}`);
      throw new Error(`읽은 책 목록 조회 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async findBookHistoryByBookIdAndUserId(
    bookId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<BookHistory> {
    try {
      return await this.bookHistoryModel.findOne({ bookId, userId }).exec();
    } catch (error) {
      Logger.error(`findBookHistoryByBookIdAndUserId 실패: ${error.message}`);
      throw new Error(
        `읽은 책 목록 조회 및 업데이트 실패했어요. 다시 시도해 주세요.`,
      );
    }
  }

  async updateBookHistory(
    bookId: Types.ObjectId,
    updateBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    try {
      const { lastPage, rate } = updateBookHistoryDto;

      const updateOps =
        lastPage === 1
          ? { $set: { lastPage, rate }, $inc: { count: 1 } }
          : { $set: { lastPage, rate } };

      return await this.bookHistoryModel
        .findOneAndUpdate({ bookId }, updateOps, {
          new: true,
          upsert: true,
        })
        .exec();
    } catch (error) {
      Logger.error(`updateBookHistory 실패: ${error.message}`);
      throw new Error(`읽은 책 목록 업데이트 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async findAllBooks(
    query: any,
    page: number,
    limit: number,
  ): Promise<{ total: number; books: Book[] }> {
    const sort = query.sort;
    delete query.sort;

    let findQuery = this.bookModel.find(query);
    if (query.title) {
      const regex = new RegExp(query.title, 'i');
      findQuery = this.bookModel.find({ title: { $regex: regex } });
    }

    const queryCondtion = {
      recent: { createdAt: -1 },
      like: { likesCount: -1 },
      count: { count: -1 },
    };
    findQuery = findQuery.sort(queryCondtion[sort]);

    // if (sort === 'recent') {
    //   findQuery = findQuery.sort({ createdAt: -1 });
    // } else if (sort === 'like') {
    //   findQuery = findQuery.sort({ likesCount: -1 });
    // } else if (sort === 'count') {
    //   findQuery = findQuery.sort({ count: -1 });
    // }

    const totalCount = await this.bookModel.countDocuments(query).exec();
    const books = await findQuery
      .populate('userId', 'userId')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { total: totalCount, books };
  }

  async findBookByBookId(id: string): Promise<Book> {
    try {
      const book = await this.bookModel
        .findByIdAndUpdate(id, { $inc: { count: 1 } }, { new: true })
        .populate('userId', 'nickname')
        .exec();
      if (!book) {
        throw new NotFoundException('책을 찾지 못했어요.');
      }
      return book;
    } catch (error) {
      Logger.error(`findBookByBookId 실패: ${error.message}`);
      throw new NotFoundException(
        `책 불러오기 실패했어요. 다시 시도해 주세요.`,
      );
    }
  }

  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
    writerId: string,
  ): Promise<Book> {
    try {
      const bookId = new Types.ObjectId(id);
      const book = await this.bookModel.findById(bookId).exec();
      if (!book) {
        throw new NotFoundException('책이 없어요.');
      }

      if (book.userId.toString() !== writerId) {
        throw new UnauthorizedException('작성자만 수정할 수 있어요!');
      }

      const updatedBook = await this.bookModel
        .findByIdAndUpdate(bookId, updateBookDto, { new: true })
        .exec();

      return updatedBook;
    } catch (error) {
      Logger.error(`updateBook 실패: ${error.message}`);
      throw new Error(`책 업데이트 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async deleteBook(id: string, writerId: string): Promise<Book> {
    const bookId = new Types.ObjectId(id);
    const book = await this.bookModel.findById(bookId).exec();
    if (!book) {
      throw new NotFoundException('책이 없어요.');
    }

    if (book.userId.toString() !== writerId) {
      throw new UnauthorizedException('작성자만 삭제할 수 있어요!');
    }
    return this.bookModel.findByIdAndDelete(bookId).exec();
  }

  async updateBookLike(id: string, book: Book) {
    try {
      return await this.bookModel.findByIdAndUpdate(id, book, { new: true });
    } catch (error) {
      Logger.error(`updateBookLike 실패: ${error.message}`);
      throw new Error(`좋아요 추가 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async addLike(userObjectId: string, bookId: string) {
    try {
      const book = await this.findBookByBookId(bookId);
      if (!book) {
        throw new NotFoundException('책이 없어요.');
      }

      if (book.likes.includes(new Types.ObjectId(userObjectId))) {
        throw new BadRequestException('이미 좋아요를 누르셨어요.');
      }

      book.likes.push(new Types.ObjectId(userObjectId));
      book.likesCount = book.likes.length;

      return await this.updateBookLike(bookId, book);
    } catch (error) {
      Logger.error(`addLike 실패: ${error.message}`);
      throw new Error(`좋아요 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async removeLike(userId: string, bookId: string) {
    try {
      const book = await this.findBookByBookId(bookId);
      if (!book) {
        throw new NotFoundException('책이 없어요.');
      }
      const index = book.likes.indexOf(new Types.ObjectId(userId));
      if (index > -1) {
        book.likes.splice(index, 1);
        book.likesCount = book.likes.length;
        return await this.updateBookLike(bookId, book);
      } else {
        throw new BadRequestException('아직 좋아요를 누르지 않았어요.');
      }
    } catch (error) {
      Logger.error(`removeLike 실패: ${error.message}`);
      throw new Error(`좋아요 삭제 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async getLikedBooks(userId: string) {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('유효하지 않은 아이디예요.');
      }

      const userObjectId = new Types.ObjectId(userId);
      const books = await this.bookModel.find({
        likes: { $in: [userObjectId] },
      });

      if (!books) {
        throw new NotFoundException('좋아요 누른 책이 없어요.');
      }

      return await books;
    } catch (error) {
      Logger.error(`getLikedBooks 실패: ${error.message}`);
      throw new Error(`좋아요 책 목록 조회 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async addDislike(userId: string, bookId: string) {
    try {
      const book = await this.findBookByBookId(bookId);
      if (!book) {
        throw new NotFoundException('책이 없어요.');
      }
      if (!book.dislikes.includes(new Types.ObjectId(userId))) {
        book.dislikes.push(new Types.ObjectId(userId));
        book.dislikesCount = book.dislikes.length;
        return await this.updateBookLike(bookId, book);
      } else {
        throw new BadRequestException('이미 싫어요를 누르셨어요.');
      }
    } catch (error) {
      Logger.error(`addDislike 실패: ${error.message}`);
      throw new Error(`싫어요 실패했어요. 다시 시도해 주세요.`);
    }
  }

  async removeDislike(userId: string, bookId: string) {
    try {
      const book = await this.findBookByBookId(bookId);
      if (!book) {
        throw new NotFoundException('책이 없어요.');
      }
      const index = book.dislikes.indexOf(new Types.ObjectId(userId));
      if (index > -1) {
        book.dislikes.splice(index, 1);
        book.dislikesCount = book.dislikes.length;
        return await this.updateBookLike(bookId, book);
      } else {
        throw new BadRequestException('아직 싫어요를 누르지 않았어요.');
      }
    } catch (error) {
      Logger.error(`removeDislike 실패: ${error.message}`);
      throw new Error(`싫어요 삭제 실패했어요. 다시 시도해 주세요.`);
    }
  }
}
