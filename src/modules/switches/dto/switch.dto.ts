import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDate } from 'class-validator';

export class CreateSwitchDto {
  @IsString()
  @IsNotEmpty()
  device_id: string;

  @IsString()
  @IsNotEmpty()
  device_code: string;

  @IsString()
  @IsOptional()
  device_name?: string;

  @IsString()
  @IsOptional()
  device_m2m_number?: string;

  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsNotEmpty()
  house_id: string;

  @IsString()
  @IsNotEmpty()
  allocated_to_customer_id: string;

  @IsString()
  @IsOptional()
  allocated_to_customer_name?: string;

  @IsString()
  @IsOptional()
  electronic_object?: string;

  @IsString()
  @IsOptional()
  device_icon?: string;

  @IsBoolean()
  @IsOptional()
  switch_is_active?: boolean;

  @IsOptional()
  allocated_at?: Date;
}

export class UpdateSwitchDto {
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

  @IsString()
  @IsOptional()
  device_icon?: string;

  @IsBoolean()
  @IsOptional()
  switch_is_active?: boolean;
}
