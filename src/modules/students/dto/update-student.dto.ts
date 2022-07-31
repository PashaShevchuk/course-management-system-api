import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudentDto {
  @ApiProperty()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsOptional()
  birth_date: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8)
  password: string;
}
