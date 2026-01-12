import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  device_code: string;

  @IsString()
  @Matches(/^[0-9]{13}$/, {
    message: 'device_m2m_number must be exactly 13 digits (0-9 only)',
  })
  device_m2m_number: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsString()
  @IsOptional()
  timestamp?: string;
}
