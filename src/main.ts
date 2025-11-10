import { webcrypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://cafe-k5p5.onrender.com',
      'https://doan2cafe.onrender.com',
      'https://testapi-roan.vercel.app',
      'https://doan2cafe-production.up.railway.app',
      'http://103.209.34.233'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Methods',
      'ngrok-skip-browser-warning',
      'access-control-allow-origin',
    ],
    credentials: true,
  };

  app.enableCors(corsOptions); // Áp dụng CORS

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Coffee Management API')
    .setDescription('API documentation for the Coffee Shop Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
