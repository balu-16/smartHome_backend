import { IsString } from 'class-validator';

export class SendSmsDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  message: string;
}
