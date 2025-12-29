// src/config/database.config.ts
export default () => ({
    database: {
        url: process.env.MONGO_URI || 'mongodb://localhost:27017/nest_js_project',
    },
});
