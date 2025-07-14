import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../schemas/roles.enum';
import * as jwt from 'jsonwebtoken';
import { AuthService } from '../auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector,
        @Inject(AuthService) private authService: AuthService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<UserRole[]>(
            'roles',
            context.getHandler()
        );
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = request.cookies?.['jwt'];
        if (!token) return false;
        const user = jwt.verify(token, process.env.JWT_SECRET || 'secret') as jwt.JwtPayload;
        const base_user: any = await this.authService.getUserByEmail(user.email);
        return requiredRoles.some(role => base_user.roles.includes(role));
    }
}