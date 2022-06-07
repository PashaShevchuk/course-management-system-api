import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader = req.headers.authorization;

      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      const tokenPrivateKey = this.configService.getTokenPrivateKey();

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException();
      }

      req.user = this.jwtService.verify(token, { secret: tokenPrivateKey });

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
