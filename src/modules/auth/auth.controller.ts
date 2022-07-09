import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

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
    return this.authService.login(loginUserDto);
  }

  @ApiOperation({ summary: 'Decline token' })
  @UseGuards(JwtAuthGuard)
  @Get('/decline')
  async declineToken(@Req() req) {
    this.logger.log(`${this.LOGGER_PREFIX} decline token`);
    return this.authService.declineToken(req.user.id);
  }
}
