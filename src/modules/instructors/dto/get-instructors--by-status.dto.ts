import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetInstructorsByStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;
}
