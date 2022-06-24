import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCoursesByStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  is_published: boolean;
}
