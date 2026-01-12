import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS with proper configuration
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-device-api-key'],
    });

    // Enable validation pipes globally
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();
  }
  return app;
}

// For local development
async function startServer() {
  const application = await bootstrap();
  const port = process.env.PORT || 3001;
  await application.listen(port);
  console.log(`🚀 SmartHome Backend Server running on port ${port}`);
  console.log(`📱 Device management ready`);
}

// Export for Vercel serverless
export default async function handler(req: any, res: any) {
  const application = await bootstrap();
  const instance = application.getHttpAdapter().getInstance();
  return instance(req, res);
}

// Start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}
