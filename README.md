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

<h1 align="center">Premium NestJS Security & Scalability Architecture</h1>

<p align="center">
  <b>A high-performance, enterprise-ready NestJS boilerplate featuring advanced security hardening, distributed caching, and background task management.</b>
</p>

---

## 🚀 Key Features

### 🛡️ Enterprise Security Suite
- **Advanced Authentication**: JWT-based login with dynamic token blacklisting on logout.
- **Granular Authorization**: Dual-layer access control:
  - **Role-Based (RBAC)**: Distinct permissions for `ADMIN` and `USER` roles.
  - **Ownership-Based**: Automatic verification of resource ownership (Users can only modify their own profiles/posts).
- **Brute-Force Protection**: 
  - **Account Lockout**: Automatic 15-minute lockout after 5 failed login attempts.
  - **Distributed Throttler**: Redis-backed rate limiting (100 req/min global, 5 req/min auth).
- **Hardened Infrastructure**: Pre-configured `Helmet` headers, `CORS` whitelisting, and `Gzip` compression.

### ⚡ Performance & Scalability
- **Global Redis Caching**: Automatic caching layer for high-demand resources with manual invalidation on updates.
- **Background Jobs**: Bull Queue integration for asynchronous tasks like email notification delivery.
- **Database Architecture**: High-speed MongoDB integration via Prisma ORM with structured schemas and automated migrations.

### 🛠️ Developer Experience
- **Bull Dashboard**: Visual monitoring of background tasks (Secured via Admin-only middleware at `/admin/queues`).
- **Comprehensive Testing**: 
  - **Unit Testing**: 100% coverage on core services and controllers.
  - **E2E Testing**: Automated integration tests for Auth, Users, and Posts modules.
- **Clean Code Architecture**: Follows best practices with standard Response Interceptors and Global Exception Filters.

---

## 📦 Tech Stack

- **Framework**: [NestJS v11](https://nestjs.com/)
- **Runtime**: [Node.js v20+](https://nodejs.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Cache/Queue**: [Redis](https://redis.io/)
- **Security**: [Helmet](https://helmetjs.github.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Testing**: [Jest](https://jestjs.io/), [Supertest](https://github.com/visionmedia/supertest)

---

## ⚙️ Project Setup

### 1. Prerequisites
- Node.js (v20+)
- MongoDB instance (Atlas or local)
- Redis server

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Application
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_ultra_secure_secret
JWT_EXPIRES_IN=1h

# Database
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/dbname"

# Cache & Queue (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Mail (Optional)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=user@example.com
MAIL_PASS=password
```

### 3. Installation
```bash
$ npm install
```

### 4. Database Sync
```bash
$ npx prisma generate
```

---

## 🏃 Running the App

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run build
$ npm run start:prod
```

---

## 🧪 Testing Suite

We maintain a rigorous testing standard to ensure architectural stability.

```bash
# Run all tests (Unit + E2E)
$ npm run test

# Run specific module E2E tests
$ npm run test:e2e

# Run with coverage report
$ npm run test:cov
```

---

## 📈 Monitoring

Access the secondary administrative dashboard to monitor queue health:

- **Endpoint**: `http://localhost:3000/admin/queues`
- **Access**: Requires `ADMIN` role token in the Authorization header.

---

## 📜 API Documentation Summary

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | User Registration | Public (Throttled) |
| **POST** | `/auth/login` | User Login | Public (Lockout protection) |
| **GET** | `/auth/profile` | Current Profile | Private |
| **GET** | `/users` | List All Users | Admin Only |
| **GET** | `/posts` | Feed | Public |
| **POST** | `/posts` | Create Post | Private |
| **PATCH** | `/posts/:id` | Update Post | Owner Only |

---

## 📄 License
This project is [MIT licensed](LICENSE).
