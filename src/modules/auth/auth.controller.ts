import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    console.log('📱 Send OTP endpoint called');
    console.log('📱 Request body:', sendOtpDto);

    try {
      const { phoneNumber, name } = sendOtpDto;

      if (!phoneNumber) {
        throw new HttpException(
          {
            success: false,
            error: 'Phone number is required',
            message: 'Phone number must be provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const formattedPhone = this.otpService.formatPhoneNumber(phoneNumber);

      if (!this.otpService.validatePhoneNumber(formattedPhone)) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid phone number format',
            message:
              'Phone number must be a valid 10-digit Indian mobile number starting with 6-9',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const userInfo = await this.authService.findUserByPhone(formattedPhone);

      let message = '';
      if (userInfo.exists) {
        message = `OTP sent successfully for ${userInfo.userType} login`;
      } else {
        message = 'OTP sent successfully for registration';
      }

      const result = await this.otpService.sendOTP(formattedPhone, name);

      const smsSuccess = result.smsResult && result.smsResult.success;

      if (!smsSuccess) {
        console.error(
          `❌ SMS failed but OTP was stored in database for ${formattedPhone}`,
        );
      }

      return {
        success: true,
        message: smsSuccess
          ? message
          : `${message} (SMS delivery may have failed)`,
        phoneNumber: formattedPhone,
        userExists: userInfo.exists,
        smsStatus: smsSuccess,
      };
    } catch (error: any) {
      console.error('📱 Send OTP error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: 'Failed to send OTP',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    console.log('🔐 Verify OTP endpoint called');
    console.log('🔐 Request body:', verifyOtpDto);

    try {
      const { phoneNumber, otp, name, email } = verifyOtpDto;

      if (!phoneNumber || !otp) {
        throw new HttpException(
          {
            success: false,
            error: 'Phone number and OTP are required',
            message: 'Both phone number and OTP must be provided',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const formattedPhone = this.otpService.formatPhoneNumber(phoneNumber);

      if (!this.otpService.validatePhoneNumber(formattedPhone)) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid phone number format',
            message:
              'Phone number must be a valid 10-digit Indian mobile number starting with 6-9',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!/^\d{6}$/.test(otp)) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid OTP format',
            message: 'OTP must be a 6-digit number',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const otpResult = await this.otpService.verifyOTP(formattedPhone, otp);

      if (!otpResult.isValid) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid or expired OTP',
            message: otpResult.message,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      let userInfo = await this.authService.findUserByPhone(formattedPhone);
      let isNewUser = false;
      let message = '';

      if (userInfo.exists && userInfo.user) {
        switch (userInfo.userType) {
          case 'superadmin':
            message = 'Super admin login successful';
            break;
          case 'admin':
            message = 'Admin login successful';
            break;
          case 'technician':
            message = 'Technician login successful';
            break;
          case 'customer':
            message = 'Customer login successful';
            break;
        }
        console.log(`✅ ${userInfo.userType} logged in: ${(userInfo.user as any).full_name}`);
      } else {
        const userName = name || `User_${formattedPhone.slice(-4)}`;
        const newUser = await this.authService.createUser(
          formattedPhone,
          userName,
          email,
        );
        userInfo = {
          exists: true,
          userType: 'customer',
          user: newUser,
        };
        isNewUser = true;
        message = 'Registration successful';
      }

      const user = userInfo.user as any;
      const sessionToken = this.authService.generateSessionToken(user._id.toString());

      return {
        success: true,
        message,
        isNewUser,
        userType: userInfo.userType,
        user: {
          id: user._id.toString(),
          phoneNumber: user.phone_number,
          name: user.full_name,
          createdAt: user.created_at,
          role: userInfo.userType,
        },
        sessionToken,
        otpVerified: true,
      };
    } catch (error: any) {
      console.error('🔐 Verify OTP error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: 'OTP verification failed',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('profile/:sessionToken')
  async getProfile(@Param('sessionToken') sessionToken: string) {
    console.log('👤 Get profile endpoint called');

    try {
      const tokenData = this.authService.parseSessionToken(sessionToken);

      if (!tokenData) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid session token',
            message: 'Valid session token is required',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.authService.getUserById(tokenData.userId);

      if (!user) {
        throw new HttpException(
          {
            success: false,
            error: 'User not found',
            message: 'User profile not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Profile retrieved successfully',
        user: {
          id: user._id.toString(),
          phoneNumber: user.phone_number,
          name: user.full_name,
          createdAt: (user as any).created_at,
        },
      };
    } catch (error: any) {
      console.error('👤 Get profile error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: 'Failed to get profile',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('profile/:sessionToken')
  async updateProfile(
    @Param('sessionToken') sessionToken: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    console.log('✏️ Update profile endpoint called');

    try {
      const tokenData = this.authService.parseSessionToken(sessionToken);

      if (!tokenData) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid session token',
            message: 'Valid session token is required',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { name } = updateProfileDto;

      if (!name || name.trim().length < 2) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid name',
            message: 'Name must be at least 2 characters long',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get user info to determine userType
      const userInfo = await this.authService.getUserById(tokenData.userId);
      if (!userInfo) {
        throw new HttpException(
          {
            success: false,
            error: 'User not found',
            message: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.authService.updateUserProfile(
        tokenData.userId,
        name,
        userInfo.userType,
      );

      if (!updatedUser) {
        throw new HttpException(
          {
            success: false,
            error: 'Failed to update profile',
            message: 'User not found',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id.toString(),
          phoneNumber: updatedUser.phone_number,
          name: updatedUser.full_name,
          createdAt: (updatedUser as any).created_at,
        },
      };
    } catch (error: any) {
      console.error('✏️ Update profile error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          error: 'Failed to update profile',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup-otps')
  async cleanupOtps() {
    console.log('🧹 Cleanup OTPs endpoint called');

    try {
      await this.otpService.cleanupExpiredOTPs();

      return {
        success: true,
        message: 'Expired OTPs cleaned up successfully',
      };
    } catch (error: any) {
      console.error('🧹 Cleanup OTPs error:', error);
      throw new HttpException(
        {
          success: false,
          error: 'Failed to cleanup expired OTPs',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
