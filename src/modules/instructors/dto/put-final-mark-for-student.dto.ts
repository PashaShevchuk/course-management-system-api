import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PutFinalMarkForStudentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}
