import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAdminsByStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;
}
