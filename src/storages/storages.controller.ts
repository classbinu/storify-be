import {
  Body,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StoragesService } from './storages.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { fileDto } from './dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Base64Dto } from './dto/base64.dto';

@ApiTags('storages')
@Controller('storages')
export class StoragesController {
  constructor(private readonly storagesService: StoragesService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '업로드할 파일',
    type: fileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(200)
  @Post('upload')
  async saveImage(@UploadedFile() file: Express.Multer.File) {
    return await this.storagesService.fileUploadToS3(file);
  }

  @Post('upload/base64')
  async saveImageByBase64(@Body() base64Dto: Base64Dto) {
    return await this.storagesService.fileUploadToS3ByBase64(base64Dto);
  }
}
