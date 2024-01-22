import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Book } from './schema/book.schema';
// import { CreateBookDto } from './dto/create-book.dto';
// import { UpdateBookDto } from './dto/update-book.dto';
import { BookMongoRepository } from './books.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { StoragesService } from 'src/storages/storages.service';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class BooksService {
  constructor(
    private readonly bookRepository: BookMongoRepository,
    private readonly utilsService: UtilsService,
    private readonly storagesService: StoragesService,
  ) {}

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    return await this.bookRepository.createBook(createBookDto);
  }

  async saveImage(file: Express.Multer.File) {
    return await this.imageUpload(file);
  }

  // S3 이미지 업로드
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

  async findAllBooks(): Promise<Book[]> {
    return this.bookRepository.findAllBooks();
  }

  async findByQuery(query): Promise<Book[]> {
    return this.bookRepository.findByQuery(query);
  }

  async findBookById(id: string): Promise<Book> {
    return this.bookRepository.findBookById(id);
  }

  async deleteBook(id: string, userId: string): Promise<Book> {
    const book = await this.bookRepository.findBookById(id);

    if (book.userId.toString() !== userId) {
      throw new UnauthorizedException();
    }

    return this.bookRepository.deleteBook(id);
  }
}
