import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { ConfigService } from '@nestjs/config';
// aws.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoragesService {
  s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
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
      console.error(`Error uploading image to S3: ${error}`);
      throw new Error('Image upload failed');
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
      console.error(`Error uploading buffer to S3: ${error}`);
      throw new Error('Buffer upload failed');
    }
  }
}
