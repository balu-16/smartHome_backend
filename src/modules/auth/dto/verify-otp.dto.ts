import { IsString, IsOptional, IsEmail, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
