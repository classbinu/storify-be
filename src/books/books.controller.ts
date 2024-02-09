import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { Book } from './schema/book.schema';
import { BookHistory } from './schema/book-history.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookHistoryDto } from './dto/create-book-history.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
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
    const userId = req.user.sub;
    createBookHistoryDto.userId = userId;
    createBookHistoryDto.bookId = new Types.ObjectId(bookId);

    return this.booksService.createOrUpdateBookHistory(createBookHistoryDto);
  }

  // @ApiOperation({ summary: '게시글 작성, 수정 시 이미지 업로드' })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: '업로드할 파일',
  //   type: ImageUploadDto,
  // })
  // @UseInterceptors(FileInterceptor('file'))
  // @HttpCode(200)
  // @Post('image')
  // async saveImage(@UploadedFile() file: Express.Multer.File) {
  //   return await this.booksService.imageUpload(file);
  // }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get('/likes')
  async getLikedBooks(@Req() req) {
    const userId = req.user.sub;
    return await this.booksService.getLikedBooks(userId);
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
  @ApiQuery({
    name: 'sort',
    required: false,
    type: 'string',
    description: '최신순: recent(기본값), 좋아요순: like, 조회순: count',
  })
  @Get()
  async findAllBooks(
    @Query('title') title: string,
    @Query('userId') userId: string,
    @Query('page') pageStr: string,
    @Query('limit') limitStr: string,
    @Query('sort') sort: string = 'recent',
  ): Promise<{ total: number; books: Book[] }> {
    const validSort = ['recent', 'like', 'count'];
    if (sort && !validSort.includes(sort)) {
      throw new Error(`Invalid sort value: ${sort}`);
    }

    const query: any = {};
    if (title) query.title = title;
    if (userId) query.userId = userId;
    if (sort) query.sort = sort;

    const validQuery = ['title', 'userId', 'page', 'limit', 'sort'];
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

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Req() req: any,
  ): Promise<Book> {
    const writerId = req.user.sub;
    return this.booksService.updateBook(id, updateBookDto, writerId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async deleteBook(@Param('id') id: string, @Req() req: any): Promise<Book> {
    const writerId = req.user.sub;
    return this.booksService.deleteBook(id, writerId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post(':bookId/likes')
  async addLike(@Param('bookId') bookId: string, @Req() req) {
    const userId = req.user.sub;
    return await this.booksService.addLike(userId, bookId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':bookId/likes')
  async removeLike(@Param('bookId') bookId: string, @Req() req) {
    const userId = req.user.sub;
    return await this.booksService.removeLike(userId, bookId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Post(':bookId/dislikes')
  async addDislike(@Param('bookId') bookId: string, @Req() req) {
    const userId = req.user.sub;
    return await this.booksService.addDislike(userId, bookId);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':bookId/dislikes')
  async removeDislike(@Param('bookId') bookId: string, @Req() req) {
    const userId = req.user.sub;
    return await this.booksService.removeDislike(userId, bookId);
  }
}
