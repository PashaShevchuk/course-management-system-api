import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;
}
