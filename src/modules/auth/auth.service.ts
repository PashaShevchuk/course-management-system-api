import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { AdminsService } from '../admins/admins.service';
import { Admin } from '../../db/entities/admin/admin.entity';
import { LoginUserResponseDto } from './dto/login-user-response.dto';
import { Instructor } from '../../db/entities/instructor/instructor.entity';
import { InstructorsService } from '../instructors/instructors.service';
import { RedisService } from '../redis/redis.service';
import { DecodedTokenDto } from './dto/decoded-token.dto';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class AuthService {
  private PASSWORD_HASH_ROUNDS = 10;
  private LOGGER_PREFIX = '[AuthService]:';
  private logger = new Logger();

  constructor(
    @Inject(forwardRef(() => AdminsService))
    private readonly adminsService: AdminsService,
    @Inject(forwardRef(() => InstructorsService))
    private readonly instructorsService: InstructorsService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
    this.logger.log(`${this.LOGGER_PREFIX} user login`);

    const user = await this.validateUser(loginUserDto);
    const token = this.generateToken(user);

    return token;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.PASSWORD_HASH_ROUNDS);
  }

  decodeToken(token: string): DecodedTokenDto {
    return <DecodedTokenDto>this.jwtService.decode(token);
  }

  verifyToken(token: string): DecodedTokenDto {
    const tokenPrivateKey = this.configService.getTokenPrivateKey();

    return this.jwtService.verify(token, { secret: tokenPrivateKey });
  }

  async declineToken(userId: string) {
    await this.redisService.del(userId);
  }

  private async generateToken(user: Admin | Instructor) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    await this.redisService.set(user.id, token);

    return {
      token,
    };
  }

  private async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<Admin | Instructor> {
    let user = await this.adminsService.getAdminByParams({
      email: loginUserDto.email,
    });

    if (!user) {
      user = await this.instructorsService.getInstructorByParams({
        email: loginUserDto.email,
      });
    }

    // TODO: student
    // if (!user) {
    //   user = await this.instructorsService.getInstructorByParams({
    //     email: loginUserDto.email,
    //   });
    // }

    if (!user || !user.is_active) {
      throw new UnauthorizedException();
    }

    const match: boolean = await this.comparePassword(
      loginUserDto.password,
      user.hash_password,
    );

    if (!match) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private async comparePassword(
    password: string,
    hash_password: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash_password);
  }
}
