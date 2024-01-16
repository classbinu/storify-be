import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule} from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config'
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
  
  await app.listen(3000);
}
bootstrap();
