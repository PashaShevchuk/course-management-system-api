import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  feedback_id: string;

  @ApiProperty()
  @IsNotEmpty()
  text: string;
}
