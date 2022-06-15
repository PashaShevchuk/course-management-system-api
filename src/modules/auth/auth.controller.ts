import { Body, Controller, Logger, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private LOGGER_PREFIX = '[AuthController]:';
  private logger = new Logger();

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Log in' })
  @ApiResponse({ type: LoginUserResponseDto })
  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoginUserResponseDto> {
    this.logger.log(`${this.LOGGER_PREFIX} user login`);
    try {
      return this.authService.login(loginUserDto);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
