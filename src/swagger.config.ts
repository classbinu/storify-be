import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('storify API')
  .setDescription('storify API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
