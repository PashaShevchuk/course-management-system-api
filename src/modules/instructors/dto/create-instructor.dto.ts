import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateInstructorDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  position: string;

  @IsNotEmpty()
  is_active: boolean;
}
