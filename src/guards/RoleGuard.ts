import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './RoleDecorator';
import { IS_PUBLIC_KEY } from './PublicDecorator';
import { EnumRoles } from 'src/enums/role.enum';
import { UserModal } from 'src/models/User';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Public route => skip authentication
    }

    const requiredRoles = this.reflector.getAllAndOverride<EnumRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Không yêu cầu role cụ thể => cho phép qua
    }

    const request = context.switchToHttp().getRequest();
    const user: UserModal = request.user;

    if (!user || !user.role || !requiredRoles.includes(user.role as EnumRoles)) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}
