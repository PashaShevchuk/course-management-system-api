import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { AuthService } from './auth.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      // TODO: if you use Bearer you can use the same login as in "io-evloop-npp-api-authorization" -> getAccessTokenFromHeader
      const authHeader = req.headers.authorization;

      const bearer = authHeader.split(' ')[0];
      const tokenFromHeader = authHeader.split(' ')[1];

      const { id } = this.authService.decodeToken(tokenFromHeader);

      const token = await this.redisService.get(id);

      if (bearer !== 'Bearer' || !token || token !== tokenFromHeader) {
        throw new UnauthorizedException();
      }

      req.user = this.authService.verifyToken(token);

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
