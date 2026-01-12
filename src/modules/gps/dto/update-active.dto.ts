import { IsBoolean } from 'class-validator';

export class UpdateActiveDto {
  @IsBoolean()
  is_active: boolean;
}
