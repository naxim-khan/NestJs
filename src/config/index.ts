// src/config/index.ts
import { registerAs } from '@nestjs/config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';

export const appConfig = registerAs('app', () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV,
}));

export default [
    appConfig,
    databaseConfig,
    jwtConfig,
];
