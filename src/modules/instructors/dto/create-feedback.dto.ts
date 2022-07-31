import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @ApiProperty()
  @IsNotEmpty()
  text: string;
}
