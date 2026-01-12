import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  device_code: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{10,15}$/, { message: 'M2M number must be 10-15 digits' })
  device_m2m_number?: string;

  @IsString()
  @IsOptional()
  device_name?: string;

  @IsString()
  @IsOptional()
  allocated_to_customer_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  room_id?: string;

  @IsString()
  @IsOptional()
  electronic_object?: string;

  @IsBoolean()
  @IsOptional()
  switch_is_active?: boolean;

  @IsString()
  @IsOptional()
  device_icon?: string;

  @IsString()
  @IsOptional()
  qr_code?: string;
}

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  device_name?: string;

  @IsString()
  @IsOptional()
  allocated_to_customer_id?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  room_id?: string;

  @IsString()
  @IsOptional()
  electronic_object?: string;

  @IsBoolean()
  @IsOptional()
  switch_is_active?: boolean;

  @IsString()
  @IsOptional()
  device_icon?: string;

  @IsOptional()
  allocated_at?: Date;
}

export class AllocateDeviceDto {
  @IsString()
  @IsNotEmpty()
  device_code: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsOptional()
  user_name?: string;

  @IsString()
  @IsOptional()
  device_name?: string;

  @IsString()
  @IsOptional()
  room_id?: string;

  @IsString()
  @IsOptional()
  house_id?: string;

  @IsString()
  @IsOptional()
  electronic_object?: string;
}

export class ShareDeviceDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
