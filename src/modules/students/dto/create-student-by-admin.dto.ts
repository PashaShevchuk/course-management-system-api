import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PASSWORD_REGEX } from '../../../constants';

export class CreateStudentByAdminDto {
  @ApiProperty()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must contain at least one upper case English letter, one lower case English letter, one digit, and a minimum of eight in length',
  })
  password: string;

  @ApiProperty()
  @IsOptional()
  birth_date: string;

  @ApiProperty()
  @IsNotEmpty()
  is_active: boolean;
}
