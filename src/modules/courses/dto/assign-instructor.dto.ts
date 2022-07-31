import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignInstructorDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  instructorId: string;
}
