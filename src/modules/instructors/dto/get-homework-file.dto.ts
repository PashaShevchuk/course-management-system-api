import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetHomeworkFileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  homework_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  lesson_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}
