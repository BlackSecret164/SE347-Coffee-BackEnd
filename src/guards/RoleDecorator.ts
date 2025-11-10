import { SetMetadata } from '@nestjs/common';
import { EnumRoles } from 'src/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Role = (roles: EnumRoles[]) => SetMetadata(ROLES_KEY, roles);
