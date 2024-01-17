import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Storify API')
  .setDescription('Storify API description')
  .setVersion('0.1')
  .addBearerAuth()
  .build();
