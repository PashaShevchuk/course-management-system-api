import { Body, Controller, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/input/login-user.dto';
import { AuthService } from './auth.service';
import { LoginUserResponseDto } from './dto/output/login-user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
    return this.authService.login(loginUserDto);
  }
}
