import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "src/role/role.enum";



export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);