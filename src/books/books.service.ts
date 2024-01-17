import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { CreateBookDto } from './dto/create-book.dto';
// import { UpdateBookDto } from './dto/update-book.dto';
import { BookMongoRepository } from './books.repository';
import { Book } from './schema/book.schema';

@Injectable()
export class BooksService {
  constructor(private readonly bookRepository: BookMongoRepository) {}

  async createBook() {
    return 'This action adds a new book';
  }

  async findAllBooks(): Promise<Book[]> {
    return this.bookRepository.findAllBooks();
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookRepository.findBookById(id);
  }

  async findByUserId(userId: string): Promise<Book[]> {
    return this.bookRepository.findByUserId(userId);
  }

  async findBooksByCategory(category: string): Promise<Book[]> {
    return this.bookRepository.findByCategory(category);
  }

  async findBooksByTag(tag: string): Promise<Book[]> {
    return this.bookRepository.findByTag(tag);
  }

  async deleteBook(id: string, userId: string): Promise<Book> {
    const book = await this.bookRepository.findBookById(id);

    if (book.userId.toString() !== userId) {
      throw new UnauthorizedException();
    }

    return this.bookRepository.deleteBook(id);
  }
}
