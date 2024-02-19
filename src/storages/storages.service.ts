// aws.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { Base64Dto } from './dto/base64.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StoragesService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async imageUploadToS3(
    fileName: string,
    file: Express.Multer.File,
    ext: string,
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: `image/${ext}`,
      });
      await this.s3Client.send(command);

      const region = this.configService.get('AWS_REGION');
      const bucket = this.configService.get('AWS_S3_BUCKET_NAME');

      return `https://s3.${region}.amazonaws.com/${bucket}/${fileName}`;
    } catch (error) {
      Logger.error(`imageUploadToS3 실패: ${error.message}`);
      throw new Error('이미지 저장 실패했어요. 다시 시도해주세요.');
    }
  }

  async bufferUploadToS3(fileName: string, buffer: Buffer, ext: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: `image/${ext}`,
      });
      await this.s3Client.send(command);

      const region = this.configService.get('AWS_REGION');
      const bucket = this.configService.get('AWS_S3_BUCKET_NAME');

      return `https://s3.${region}.amazonaws.com/${bucket}/${fileName}`;
    } catch (error) {
      Logger.error(`bufferUploadToS3 실패: ${error.message}`);
      throw new Error('Buffer 업로드 실패했어요.');
    }
  }

  async fileUploadToS3(file: Express.Multer.File) {
    const fileNameWithExt = file.originalname;
    const lastDotIndex = fileNameWithExt.lastIndexOf('.');
    const fileName = fileNameWithExt.substring(0, lastDotIndex);
    const ext = fileNameWithExt.substring(lastDotIndex + 1);
    const key = `${fileName}-${Date.now()}.${ext}`;
    const buffer = file.buffer;

    try {
      const contentType = file.mimetype;

      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: `public/${key}`,
        Body: buffer,
        ACL: 'public-read',
        ContentType: contentType,
      });
      await this.s3Client.send(command);

      const region = this.configService.get('AWS_REGION');
      const bucket = this.configService.get('AWS_S3_BUCKET_NAME');

      return `https://s3.${region}.amazonaws.com/${bucket}/public/${key}`;
    } catch (error) {
      Logger.error(`bufferUploadToS3 실패: ${error.message}`);
      throw new Error('Buffer 업로드 실패했어요.');
    }
  }

  async fileUploadToS3ByBase64(base64Dto: Base64Dto) {
    const base64 = base64Dto.base64;
    const buffer = Buffer.from(base64, 'base64');
    const ext = 'png';
    const fileName = `${Date.now()}.${ext}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
        ContentType: `image/${ext}`,
      });
      await this.s3Client.send(command);

      const region = this.configService.get('AWS_REGION');
      const bucket = this.configService.get('AWS_S3_BUCKET_NAME');

      return `https://s3.${region}.amazonaws.com/${bucket}/${fileName}`;
    } catch (error) {
      Logger.error(`fileUploadToS3ByBase64 실패: ${error.message}`);
      throw new Error('Base64 이미지 업로드 실패했어요.');
    }
  }
}
