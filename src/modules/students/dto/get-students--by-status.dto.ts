import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetStudentsByStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;
}
