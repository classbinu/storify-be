import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { GlobalExceptionFilter } from './filter/GlobalExceptionFilter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './swagger.config';
import * as swaggerUi from 'swagger-ui-express';
import { EnvFilterMiddleware } from './middlewares/envFilter.middleware';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';

dotenv.config();
const authId = process.env.ADMIN;
const password = process.env.PASSWORD;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['Authorization'],
  };

  app.enableCors(corsOptions);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalFilters(new GlobalExceptionFilter());
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.use(
    '/docs',
    basicAuth({
      users: { [authId]: password },
      challenge: true,
      unauthorizedResponse: 'Unauthorized',
    }),
    swaggerUi.serve,
    swaggerUi.setup(document),
  );

  app.use(helmet());

  // Increase JSON limit to 1MB
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(new EnvFilterMiddleware().use);
  await app.listen(3000);
}
bootstrap();
