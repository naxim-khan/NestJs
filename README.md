<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

<h1 align="center">NestJS Backend - Security & Scalability</h1>

<p align="center">
  <b>Personal project implementing security hardening, distributed caching, and background task management.</b>
</p>

---

## 🛠️ Implementation Details

### Security
- **Authentication**: JWT-based login with Redis-backed token blacklisting for logout.
- **Authorization**: 
  - **RBAC**: Roles for `ADMIN` and `USER`.
  - **Ownership**: Logic to ensure users only modify their own data.
- **Brute-Force Protection**: 
  - **Account Lockout**: 15-minute lockout after 5 failed attempts.
  - **Rate Limiting**: Redis-backed throttling (100 req/min global, 5 req/min auth).
- **Environment & Headers**: Pre-configured `Helmet` and environment-based `CORS`.
- **Health Checks**: Liveness and readiness endpoints for monitoring.

### Performance
- **Caching**: Global Redis caching for database queries.
- **Queues**: Bull Queue for background jobs (e.g., emails).
- **Database**: MongoDB with Prisma ORM.

### Monitoring & UI
- **Swagger**: Auto-generated API docs.
- **Bull Dashboard**: Interface for monitoring background tasks at `/admin/queues`.

---

## ⚙️ Setup & Installation

### 1. Requirements
- Node.js (v20+)
- MongoDB
- Redis

### 2. Environment Setup
Create a `.env` file:

```env
# App
PORT=3000
NODE_ENV=development

# Auth
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1h

# DB
MONGO_URI="mongodb://localhost:27017/dbname"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASS=password
```

### 3. Install & Generate
```bash
npm install
npx prisma generate
```

---

## 🏃 Commands

```bash
# Start development
npm run start:dev

# Run tests
npm test

# Production build
npm run build
npm run start:prod
```

---

## 🐳 Docker Setup

Run everything in containers:

```bash
# Start all services
docker-compose up --build

# Run in background
docker-compose up -d
```

---

## 📖 API & Documentation

### Swagger UI
Documentation and live testing available at:
- `http://localhost:3000/api/docs`

### Postman
- [Postman Collection Link](https://documenter.getpostman.com/view/26901515/2sBXVckCjz#2aee7993-d2f8-44a0-93f1-5ca64ea4c227)

---

## 📈 Health & Monitoring

- **Liveness**: `GET /api/health`
- **Readiness**: `GET /api/health/ready`
- **Queue Dashboard**: `GET /api/admin/queues` (Admin token required)

---

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register user | Public |
| **POST** | `/api/auth/login` | Login | Public |
| **GET** | `/api/auth/profile` | View profile | Private |
| **GET** | `/api/users` | List users | Admin |
| **GET** | `/api/posts` | View feed | Public |
| **POST** | `/api/posts` | Create post | Private |
| **PATCH** | `/api/posts/:id` | Update post | Owner |
