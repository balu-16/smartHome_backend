import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { SmsService } from './sms.service';
import { SendSmsDto } from './dto/send-sms.dto';

@Controller('v1/sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    console.log('📱 SMS endpoint called!');
    console.log('📱 Request body:', sendSmsDto);

    try {
      const { phoneNumber, message } = sendSmsDto;

      console.log(`📱 Received SMS request for ${phoneNumber}`);
      console.log(`📱 Message: ${message}`);

      if (!phoneNumber) {
        console.log('❌ Missing phoneNumber');
        throw new HttpException(
          {
            success: false,
            error: 'Phone number is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Extract OTP from message if it contains one
      const otpMatch = message.match(/\b\d{6}\b/);
      if (otpMatch) {
        const otp = otpMatch[0];
        console.log(`📱 Detected OTP in message: ${otp}`);

        const result = await this.smsService.sendOtpSms(phoneNumber, otp);

        if (result.success) {
          return result;
        } else {
          throw new HttpException(result, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        console.log('❌ No OTP found in message');
        throw new HttpException(
          {
            success: false,
            error: 'Message must contain a 6-digit OTP',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error: any) {
      console.error('📱 SMS Service Error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: `Failed to send SMS: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
