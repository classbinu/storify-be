import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
    const createdBook = new this.bookModel(createBookDto);
    console.log(createdBook);
    return createdBook.save();
  }

  async createBookHistory(
    createBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    const createdBookHistory = new this.bookHistoryModel(createBookHistoryDto);
    return createdBookHistory.save();
  }

  async findBookHistoryByBookIdAndUserId(
    bookId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<BookHistory> {
    return this.bookHistoryModel.findOne({ bookId, userId }).exec();
  }

  async updateBookHistory(
    bookId: Types.ObjectId,
    updateBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    const { lastPage, rate } = updateBookHistoryDto;

    const updateOps =
      lastPage === 1
        ? { $set: { lastPage, rate }, $inc: { count: 1 } }
        : { $set: { lastPage, rate } };

    return this.bookHistoryModel
      .findOneAndUpdate({ bookId }, updateOps, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  async findAllBooks(
    query: any,
    page: number,
    limit: number,
  ): Promise<{ total: number; books: Book[] }> {
    let findQuery = this.bookModel.find(query);
    if (query.title) {
      const regex = new RegExp(query.title, 'i');
      findQuery = this.bookModel.find({ title: { $regex: regex } });
    }
    const totalCount = await this.bookModel.countDocuments(query).exec();
    const books = await findQuery
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { total: totalCount, books };
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookModel.findById(id).exec();
  }

  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
    writerId: string,
  ): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.userId.toString() !== writerId) {
      throw new UnauthorizedException('You are not the writer of this book');
    }
    Object.assign(book, updateBookDto);
    return book.save();
  }

  async deleteBook(id: string, writerId: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.userId.toString() !== writerId) {
      throw new UnauthorizedException('You are not the writer of this book');
    }
    return this.bookModel.findByIdAndDelete(id).exec();
  }
}
