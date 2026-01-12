import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import {
  OtpVerification,
  OtpVerificationSchema,
} from '../../database/schemas/otp-verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OtpVerification.name, schema: OtpVerificationSchema },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
