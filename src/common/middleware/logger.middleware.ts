// Typical things it can log
// HTTP method(GET, POST, e-t-c.)
// URL (/user/123)
// request body (optional, usually via interceptor or after response)
// Query Parameters
// User Context if (available)
// IP Address
// User Agent

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/request.types';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
        const { method, originalUrl, userContext } = req;

        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - userContext.startTime;
            const requestId = userContext.requestId;
            const userIdentifier = userContext.userId ? `[User: ${userContext.userId}]` : '[Guest]';

            const logMessage = `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms ${userIdentifier} - ${userContext.ip}`;

            if (statusCode >= 500) {
                this.logger.error(logMessage);
            } else if (statusCode >= 400) {
                this.logger.warn(logMessage);
            } else {
                this.logger.log(logMessage);
            }

            // Log Query parameters for debugging if they exist
            if (Object.keys(req.query).length > 0) {
                this.logger.debug(`[${requestId}] Query: ${JSON.stringify(req.query)}`);
            }
        });

        next();
    }
}

