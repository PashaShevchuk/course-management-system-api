import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignInstructorDto {
  @ApiProperty()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty()
  @IsNotEmpty()
  instructorId: string;
}
