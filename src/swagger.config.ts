import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Storify API')
  .setDescription('Storify API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
