import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.cookies?.['jwt'];
        if (!token) return false;
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'secret');
            return true;
        } catch {
            return false;
        }
    }
}
