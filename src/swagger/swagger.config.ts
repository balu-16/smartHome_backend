import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('SmartHome API')
    .setDescription('SmartHome Backend API Documentation - NighaTech Global')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('devices', 'Device management endpoints')
    .addTag('houses', 'House management endpoints')
    .addTag('rooms', 'Room management endpoints')
    .addTag('switches', 'Switch control endpoints')
    .addTag('gps', 'GPS signal endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}
