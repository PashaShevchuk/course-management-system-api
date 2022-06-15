import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInstructorStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;

  @ApiProperty()
  @IsNotEmpty()
  send_email: boolean;
}
