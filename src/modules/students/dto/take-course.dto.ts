import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TakeCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  course_id: string;
}
