import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  // UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { Book } from './schema/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
// import { UpdateBookDto } from './dto/update-book.dto';
import { ImageUploadDto } from './dto/image-upload.dto';
// import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('books')
// @UseGuards(AuthGuard())
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async createBook(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.createBook(createBookDto);
  }

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

  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @Get()
  async findAllBooks(
    @Query() query: any,
    @Query('page') pageStr: string,
    @Query('limit') limitStr: string,
  ): Promise<Book[]> {
    // Validate query
    const validQuery = ['userId', 'title'];
    Object.keys(query).forEach((key) => {
      if (!validQuery.includes(key)) {
        delete query[key];
      }
    });

    // Validate page and limit
    const page = Number(pageStr) > 0 ? Number(pageStr) : 1;
    const limit = Number(limitStr) > 0 ? Number(limitStr) : 10;

    return this.booksService.findAllBooks(query, page, limit);
  }

  // 모든책들 가져오는 함수 추가해야함.

  @Get(':id')
  async findBookById(@Param('id') id: string): Promise<Book> {
    return this.booksService.findBookById(id);
  }

  // @Patch(':id')
  // updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
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
