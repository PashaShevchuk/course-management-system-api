import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMarkDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  mark_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  mark: number;
}
