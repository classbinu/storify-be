import {
  Controller,
  Get,
  // Post,
  // Body,
  // Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './schema/book.schema';
// import { CreateBookDto } from './dto/create-book.dto';
// import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // @Post()
  // create(@Body() createBookDto: CreateBookDto) {
  //   return this.booksService.create(createBookDto);
  // }

  @Get()
  async findAllBooks(): Promise<Book[]> {
    return this.booksService.findAllBooks();
  }

  @Get(':id')
  async findBookById(@Param('id') id: string): Promise<Book> {
    return this.booksService.findBookById(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Book[]> {
    return this.booksService.findByUserId(userId);
  }

  @Get('category/:category')
  async findBooksByCategory(
    @Param('category') category: string,
  ): Promise<Book[]> {
    return this.booksService.findBooksByCategory(category);
  }

  @Get('tag/:tag')
  async findBooksByTag(@Param('tag') tag: string): Promise<Book[]> {
    return this.booksService.findBooksByTag(tag);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
  //   return this.booksService.update(+id, updateBookDto);
  // }

  @Delete(':id')
  async deleteBook(@Param('id') id: string, @Req() req: any): Promise<Book> {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.booksService.deleteBook(id, userId);
  }
}
