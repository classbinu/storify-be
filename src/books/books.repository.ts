import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './schema/book.schema';
import { Model } from 'mongoose';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BookMongoRepository {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const createdBook = new this.bookModel(createBookDto);
    console.log(createdBook);
    return createdBook.save();
  }

  async findAllBooks(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  async findByQuery(query: any): Promise<Book[]> {
    return this.bookModel.find(query).exec();
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookModel.findById(id).exec();
  }

  async deleteBook(id: string): Promise<Book> {
    return this.bookModel.findByIdAndDelete(id).exec();
  }
}
