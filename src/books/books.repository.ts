import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from './schema/book.schema';
import { Model } from 'mongoose';

@Injectable()
export class BookMongoRepository {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}
}
