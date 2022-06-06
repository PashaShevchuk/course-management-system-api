import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/input/login-user.dto';
import { AdminsService } from '../admins/admins.service';
import { Admin } from '../../db/entities/admin/admin.entity';
import { LoginUserResponseDto } from './dto/output/login-user-response.dto';

@Injectable()
export class AuthService {
  private PASSWORD_HASH_ROUNDS = 10;

  constructor(
    @Inject(forwardRef(() => AdminsService))
    private adminsService: AdminsService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponseDto> {
    const user = await this.validateUser(loginUserDto);

    return this.generateToken(user);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.PASSWORD_HASH_ROUNDS);
  }

  private async generateToken(user: Admin) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(loginUserDto: LoginUserDto): Promise<Admin> {
    const user = await this.adminsService.getUserByParams({
      email: loginUserDto.email,
    });

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
