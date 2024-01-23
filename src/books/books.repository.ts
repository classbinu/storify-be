import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './schema/book.schema';
import { BookHistory, BookHistoryDocument } from './schema/book-history.schema';
import { Model, Types } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';
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

  async createOrUpdateBookHistory(
    createBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    const existingHistory = await this.bookHistoryModel.findOne({
      bookId: createBookHistoryDto.bookId,
    });

    if (existingHistory) {
      return this.updateBookHistory(
        createBookHistoryDto.bookId,
        createBookHistoryDto,
      );
    }

    const createdBookHistory = new this.bookHistoryModel(createBookHistoryDto);
    return createdBookHistory.save();
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

  async findAllBooks(query: any, page: number, limit: number): Promise<Book[]> {
    let findQuery = this.bookModel.find(query);
    if (query.title) {
      const regex = new RegExp(query.title, 'i');
      findQuery = this.bookModel.find({ title: { $regex: regex } });
    }

    return findQuery
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookModel.findById(id).exec();
  }

  async deleteBook(id: string): Promise<Book> {
    return this.bookModel.findByIdAndDelete(id).exec();
  }
}
