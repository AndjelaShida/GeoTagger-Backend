import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleEnum } from './role.enum';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';

@Injectable()
export class RoleGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<RoleEnum[]>('roles', context.getHandler());

    if (!roles || roles.length === 0) {
      return true; // nema specifičnih uloga → dozvoljeno
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = roles.some((role) => role === user.role);
    if (!hasRole) {
      throw new ForbiddenException('Access denied, insufficient role');
    }

    return true;
  }
}

