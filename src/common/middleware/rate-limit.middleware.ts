import { Injectable, NestMiddleware, HttpStatus, HttpException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/request.types';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private clients = new Map<string, { count: number; expires: number }>();
    private readonly WINDOW_SIZE_MS = 60 * 1000; // 1 minute
    private readonly MAX_REQUESTS = 100;

    use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const ip = req.userContext.ip;
        const now = Date.now();

        const client = this.clients.get(ip);

        if (!client || now > client.expires) {
            this.clients.set(ip, { count: 1, expires: now + this.WINDOW_SIZE_MS });
        } else {
            client.count++;
            if (client.count > this.MAX_REQUESTS) {
                throw new HttpException(
                    'Too many requests, please try again later.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
        }

        // Standard rate limit headers
        const currentClient = this.clients.get(ip);
        if (currentClient) {
            res.setHeader('X-RateLimit-Limit', this.MAX_REQUESTS);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, this.MAX_REQUESTS - currentClient.count));
            res.setHeader('X-RateLimit-Reset', new Date(currentClient.expires).toISOString());
        }

        next();
    }
}
