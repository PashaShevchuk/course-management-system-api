import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PutMarkForStudentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  mark: number;

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
