import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './schema/book.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BookMongoRepository {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async createBook() {}

  async findAllBooks(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<Book[]> {
    return this.bookModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async findByCategory(category: string): Promise<Book[]> {
    return this.bookModel.find({ category }).exec();
  }

  async findByTag(tag: string): Promise<Book[]> {
    return this.bookModel.find({ tag: { $in: [tag] } }).exec();
  }

  async deleteBook(id: string): Promise<Book> {
    return this.bookModel.findByIdAndDelete(id).exec();
  }
}
