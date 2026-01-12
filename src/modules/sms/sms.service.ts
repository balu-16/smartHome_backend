import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Use require for node-fetch v2 compatibility with CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');

@Injectable()
export class SmsService {
  private readonly smsConfig: {
    secret: string;
    sender: string;
    tempid: string;
    route: string;
    msgtype: string;
    baseUrl: string;
  };

  constructor(private configService: ConfigService) {
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
      console.log(`📱 Sending OTP SMS to ${phoneNumber} with OTP: ${otp}`);

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
      console.log(`📱 SMS URL: ${smsUrl}`);

      const response = await fetch(smsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Node.js SMS Service/1.0',
        },
      });

      const responseText = await response.text();
      console.log(`📱 SMS API Response Status: ${response.status}`);
      console.log(`📱 SMS API Response Text: ${responseText}`);

      if (response.status === 200) {
        console.log(`✅ SMS sent successfully to ${phoneNumber}`);
        return {
          success: true,
          message: `SMS sent successfully to ${phoneNumber}`,
          apiResponse: responseText,
          status: response.status,
        };
      } else {
        console.log(`❌ SMS failed for ${phoneNumber}`);
        return {
          success: false,
          error: `SMS API returned status ${response.status}: ${responseText}`,
          apiResponse: responseText,
          status: response.status,
        };
      }
    } catch (error: any) {
      console.error('📱 SMS Service Error:', error);
      return {
        success: false,
        error: `Failed to send SMS: ${error.message}`,
      };
    }
  }
}
