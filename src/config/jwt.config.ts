// src/config/jwt.config.ts
export default () => ({
    jwt: {
        secret: process.env.JWT_SECRET || 'default_jwt_secret'
        // expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
});
