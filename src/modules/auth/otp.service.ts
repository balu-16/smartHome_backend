import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
  OtpVerification,
  OtpVerificationDocument,
} from '../../database/schemas/otp-verification.schema';
import {
  formatPhoneNumber,
  validatePhoneNumber,
  generateOTP,
} from '../../common/utils/phone.utils';
import { getOTPExpirationIST, getCurrentISTDate } from '../../common/utils/time.utils';

// Use require for node-fetch v2 compatibility with CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');

@Injectable()
export class OtpService {
  private readonly smsConfig: {
    secret: string;
    sender: string;
    tempid: string;
    route: string;
    msgtype: string;
    baseUrl: string;
  };

  constructor(
    @InjectModel(OtpVerification.name)
    private otpVerificationModel: Model<OtpVerificationDocument>,
    private configService: ConfigService,
  ) {
    this.smsConfig = {
      secret: this.configService.get('SMS_SECRET') || 'xledocqmXkNPrTesuqWr',
      sender: this.configService.get('SMS_SENDER') || 'NIGHAI',
      tempid: this.configService.get('SMS_TEMPID') || '1207174264191607433',
      route: this.configService.get('SMS_ROUTE') || 'TA',
      msgtype: this.configService.get('SMS_MSGTYPE') || '1',
      baseUrl:
        this.configService.get('SMS_BASE_URL') ||
        'http://43.252.88.250/index.php/smsapi/httpapi/',
    };
  }

  formatPhoneNumber(phoneNumber: string): string {
    return formatPhoneNumber(phoneNumber);
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    return validatePhoneNumber(phoneNumber);
  }

  async storeOTP(phoneNumber: string, otp: string): Promise<OtpVerificationDocument> {
    const expiresAt = getOTPExpirationIST();

    // Mark existing OTPs as verified (invalidate them)
    await this.otpVerificationModel.updateMany(
      { phone_number: phoneNumber, is_verified: false },
      { is_verified: true },
    );

    // Create new OTP record
    const otpRecord = new this.otpVerificationModel({
      phone_number: phoneNumber,
      otp,
      expires_at: expiresAt,
      is_verified: false,
    });

    const saved = await otpRecord.save();
    console.log(`✅ OTP stored successfully for ${phoneNumber}`);
    return saved;
  }

  async verifyOTP(
    phoneNumber: string,
    otp: string,
  ): Promise<{ isValid: boolean; message: string; otpRecord?: OtpVerificationDocument }> {
    const currentTime = getCurrentISTDate();

    const otpRecord = await this.otpVerificationModel
      .findOne({
        phone_number: phoneNumber,
        otp,
        is_verified: false,
        expires_at: { $gt: currentTime },
      })
      .sort({ created_at: -1 });

    if (!otpRecord) {
      console.log(`❌ Invalid or expired OTP for ${phoneNumber}`);
      return { isValid: false, message: 'Invalid or expired OTP' };
    }

    // Mark OTP as verified
    await this.otpVerificationModel.updateOne(
      { _id: otpRecord._id },
      { is_verified: true },
    );

    console.log(`✅ OTP verified successfully for ${phoneNumber}`);
    return {
      isValid: true,
      message: 'OTP verified successfully',
      otpRecord,
    };
  }

  async sendOtpSms(
    phoneNumber: string,
    otp: string,
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    apiResponse?: string;
    status?: number;
  }> {
    try {
      console.log(`📱 [OTP Service] Sending OTP SMS to ${phoneNumber} with OTP: ${otp}`);

      const message = `Welcome to NighaTech Global Your OTP for authentication is ${otp} don't share with anybody Thank you`;

      const params = new URLSearchParams({
        secret: this.smsConfig.secret,
        sender: this.smsConfig.sender,
        tempid: this.smsConfig.tempid,
        receiver: phoneNumber,
        route: this.smsConfig.route,
        msgtype: this.smsConfig.msgtype,
        sms: message,
      });

      const smsUrl = `${this.smsConfig.baseUrl}?${params.toString()}`;
      console.log(`📱 [OTP Service] SMS URL: ${smsUrl}`);

      const response = await fetch(smsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Node.js SMS Service/1.0',
        },
      });

      const responseText = await response.text();
      console.log(`📱 [OTP Service] SMS API Response Status: ${response.status}`);
      console.log(`📱 [OTP Service] SMS API Response Text: ${responseText}`);

      if (response.status === 200) {
        console.log(`✅ [OTP Service] SMS sent successfully to ${phoneNumber}`);
        return {
          success: true,
          message: `SMS sent successfully to ${phoneNumber}`,
          apiResponse: responseText,
          status: response.status,
        };
      } else {
        console.log(`❌ [OTP Service] SMS failed for ${phoneNumber}`);
        return {
          success: false,
          error: `SMS API returned status ${response.status}: ${responseText}`,
          apiResponse: responseText,
          status: response.status,
        };
      }
    } catch (error: any) {
      console.error('📱 [OTP Service] SMS Service Error:', error);
      return {
        success: false,
        error: `Failed to send SMS: ${error.message}`,
      };
    }
  }

  async sendOTP(
    phoneNumber: string,
    name?: string,
  ): Promise<{
    success: boolean;
    message: string;
    phoneNumber: string;
    smsResult: any;
    otp: string;
  }> {
    console.log(`📱 [OTP Service] Starting OTP process for ${phoneNumber}`);

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    if (!this.validatePhoneNumber(formattedPhone)) {
      throw new Error(
        'Invalid phone number format. Must be a valid 10-digit Indian mobile number starting with 6-9',
      );
    }

    const otp = generateOTP();
    console.log(`📱 [OTP Service] Generated OTP: ${otp}`);

    await this.storeOTP(formattedPhone, otp);

    const smsResult = await this.sendOtpSms(formattedPhone, otp);

    return {
      success: true,
      message: 'OTP sent successfully',
      phoneNumber: formattedPhone,
      smsResult,
      otp, // For debugging - remove in production
    };
  }

  async cleanupExpiredOTPs(): Promise<void> {
    const currentTime = getCurrentISTDate();
    await this.otpVerificationModel.deleteMany({
      $or: [{ expires_at: { $lt: currentTime } }, { is_verified: true }],
    });
    console.log('🧹 Expired OTPs cleaned up successfully');
  }
}
