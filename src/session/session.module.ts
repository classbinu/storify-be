// import { Module } from '@nestjs/common';
// import { SessionModule as NestSessionModule } from 'nestjs-session';
// import { ConfigService } from '@nestjs/config';
// import MongoStore from 'connect-mongo';

// @Module({
//   imports: [
//     NestSessionModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => ({
//         session: {
//           secret: configService.get<string>('SESSION_SECRET'),
//           resave: false,
//           saveUninitialized: false,
//           cookie: {
//             secure: false, // https통신일 경우 true, local test 시에만 false
//             httpOnly: true,
//           },
//           store: await MongoStore.create({
//             mongoUrl: configService.get<string>('DB_URL'),
//           }),
//         },
//       }),
//     }),
//   ],
// })
// export class SessionModule {}
