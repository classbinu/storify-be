import * as basicAuth from 'express-basic-auth';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as swaggerUi from 'swagger-ui-express';
import * as session from 'express-session';

import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { EnvFilterMiddleware } from './middlewares/envFilter.middleware';
import { GlobalExceptionFilter } from './filter/GlobalExceptionFilter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { swaggerConfig } from './swagger.config';

dotenv.config();
const authId = process.env.ADMIN;
const password = process.env.PASSWORD;

async function bootstrap() {
  // console.log('Memory usage at the start:', process.memoryUsage());
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const corsOptions: CorsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    exposedHeaders: ['Authorization'],
  };

  app.enableCors(corsOptions);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalFilters(new GlobalExceptionFilter());
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        // https는 true
        secure: false,
      },
    }),
  );

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
  // console.log('Memory usage at the end:', process.memoryUsage());
  await app.listen(3000);
}
bootstrap();
