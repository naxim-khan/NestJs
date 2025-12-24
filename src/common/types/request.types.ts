import { Request } from 'express';

export interface UserContext {
    userId?: string;
    role?: string;
    requestId: string;
    ip: string;
    userAgent: string;
    path: string;
    startTime: number;
    locale: string;
}

export interface AuthenticatedRequest extends Request {
    userContext: UserContext;
    accessToken?: string;
}
