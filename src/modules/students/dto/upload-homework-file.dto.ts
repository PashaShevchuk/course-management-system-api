import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadHomeworkFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  lesson_id: string;
}
