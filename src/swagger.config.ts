import { DocumentBuilder } from "@nestjs/swagger";

export
const swaggerConfig  = new DocumentBuilder()
.setTitle('storify example')
.setDescription('storify API description')
.setVersion('1.0')
.addBearerAuth()
.build();