import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.get<string[]>(
        ROLES_KEY,
        context.getHandler(),
      );

      if (!requiredRoles) {
        return true;
      }

      const req = context.switchToHttp().getRequest();

      return requiredRoles.includes(req.user.role);
    } catch (err) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
