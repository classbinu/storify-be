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
  BadRequestException,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { Book } from './schema/book.schema';
import { BookHistory } from './schema/book-history.schema';
import { CreateBookDto } from './dto/create-book.dto';
// import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookHistoryDto } from './dto/create-book-history.dto';
import { ImageUploadDto } from './dto/image-upload.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('Books')
@Controller('books')
// @UseGuards(AuthGuard())
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async createBook(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.createBook(createBookDto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post(':id/history')
  async createOrUpdateBookHistory(
    @Param('id') bookId: string,
    @Req() req,
    @Body() createBookHistoryDto: CreateBookHistoryDto,
  ): Promise<BookHistory> {
    const userId = req.user['sub'];
    createBookHistoryDto.userId = userId;
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid bookId');
    }

    createBookHistoryDto.bookId = new Types.ObjectId(bookId);

    return this.booksService.createOrUpdateBookHistory(createBookHistoryDto);
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

  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({
    name: 'page',
    required: false,
    type: 'number',
    description: '기본 값: 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: '기본 값: 10',
  })
  @Get()
  async findAllBooks(
    @Query('title') title: string,
    @Query('userId') userId: string,
    @Query('page') pageStr: string,
    @Query('limit') limitStr: string,
  ): Promise<Book[]> {
    const query: any = {};
    if (title) query.title = title;
    if (userId) query.userId = userId;

    const validQuery = ['title', 'userId', 'page', 'limit'];
    Object.keys(query).forEach((key) => {
      if (!validQuery.includes(key)) {
        delete query[key];
      }
    });

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
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.booksService.deleteBook(id, userId);
  }
}
