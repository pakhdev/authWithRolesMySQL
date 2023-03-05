import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoutes: string[] = this.reflector.get(
      META_ROLES,
      ctx.getHandler(),
    );
    if (!validRoutes || validRoutes.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) throw new BadRequestException('User not found');

    for (const role of user.roles.split(',')) {
      if (validRoutes.includes(role)) {
        return true; // Если true, то пропустит, можно выдать ошибку
      }
    }

    throw new ForbiddenException(
      `User ${user.email} needs a valid roles: [${validRoutes}]`,
    );
  }
}
