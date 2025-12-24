// purpose: this guard will check if the auth user has the required (role)
// to access a route.

// What it should do:
// extracts required roles from the route metadata (set by decorator)
// extracts the auth user role from the request context
// compares the roles
// if the auth user role is not in the required roles, throw UnauthorizedException 
// otherwwise return the request handler

// implementation
// 1. create a custom decorator
// import reflector to read metada
import { Reflector } from "@nestjs/core";
// implement CanActivate
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorators';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        // Admin bypass: Admins can access everything
        if (user?.role === Role.ADMIN) {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }


        const hasRole = requiredRoles.some((role) => user?.role === role);


        if (!hasRole) {
            throw new UnauthorizedException('Insufficient permissions');
        }

        return true;
    }
}