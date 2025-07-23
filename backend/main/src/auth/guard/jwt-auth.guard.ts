import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as cookie from 'cookie'; // <-- Импортируем

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const isHttp = context.getType() === 'http';
        const isWs = context.getType() === 'ws';

        let token: string | undefined;

        if (isHttp) {
            const request = context.switchToHttp().getRequest();
            token = request.cookies?.['jwt'];
        } else if (isWs) {
            const client = context.switchToWs().getClient();
            const cookieHeader = client.handshake.headers.cookie;
            const cookies = cookie.parse(cookieHeader || '');
            token = cookies['jwt'];
        }

        if (!token) return false;

        try {
            jwt.verify(token, process.env.JWT_SECRET || 'secret');
            return true;
        } catch (error) {
            return false;
        }
    }
}