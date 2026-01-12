import { IsString, IsOptional } from 'class-validator';

export class SendOtpDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  name?: string;
}
