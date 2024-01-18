import {
  Controller,
  Get,
  Post,
  // Body,
  // Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  // UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { Book } from './schema/book.schema';
// import { CreateBookDto } from './dto/create-book.dto';
// import { UpdateBookDto } from './dto/update-book.dto';
import { ImageUploadDto } from './dto/image-upload.dto';
// import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
// @UseGuards(AuthGuard())
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // @Post()
  // create(@Body() createBookDto: CreateBookDto) {
  //   return this.booksService.create(createBookDto);
  // }

  @ApiOperation({ summary: '게시글 작성, 수정 시 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '업로드할 파일',
    type: ImageUploadDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  @Post('image')
  async saveImage(@UploadedFile() file: Express.Multer.File) {
    return await this.booksService.imageUpload(file);
  }

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
