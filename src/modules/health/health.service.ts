import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import {
  OtpVerification,
  OtpVerificationDocument,
} from '../../database/schemas/otp-verification.schema';
import { getISTTimestamp } from '../../common/utils/time.utils';

@Injectable()
export class HealthService {
  constructor(
    @InjectModel(OtpVerification.name)
    private otpVerificationModel: Model<OtpVerificationDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    mongodb: {
      status: string;
      error?: string;
    };
    services: {
      sms: string;
      otp: string;
    };
  }> {
    try {
      // Test MongoDB connection
      let mongoStatus = 'connected';
      let mongoError: string | undefined;

      try {
        await this.otpVerificationModel.countDocuments().limit(1).exec();
      } catch (error: any) {
        mongoStatus = 'error';
        mongoError = error.message;
      }

      return {
        status: mongoStatus === 'connected' ? 'healthy' : 'unhealthy',
        timestamp: getISTTimestamp(),
        mongodb: {
          status: mongoStatus,
          error: mongoError,
        },
        services: {
          sms: 'available',
          otp: 'available',
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        timestamp: getISTTimestamp(),
        mongodb: {
          status: 'error',
          error: error.message,
        },
        services: {
          sms: 'unknown',
          otp: 'unknown',
        },
      };
    }
  }
}
