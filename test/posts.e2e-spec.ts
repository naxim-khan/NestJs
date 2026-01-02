import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MailQueue } from '../src/queues/email/mail.queue';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testUser = {
    name: 'Post User',
    email: 'posts-e2e@example.com',
    password: 'password123',
  };

  const otherUser = {
    name: 'Other User',
    email: 'other-e2e@example.com',
    password: 'password123',
  };

  let token: string;
  let otherToken: string;
  let postId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CACHE_MANAGER)
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
      })
      .overrideProvider(MailQueue)
      .useValue({
        addWelcomeEmailJob: jest.fn().mockResolvedValue({ id: 'mock-job' }),
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(ThrottlerStorage)
      .useValue({
        increment: jest
          .fn()
          .mockResolvedValue({ totalHits: 0, timeToReset: 60 }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    // Fix for "UnsupportedMediaTypeError: unsupported charset UTF-8"
    app.use((req, res, next) => {
      if (req.headers['content-type']?.includes('UTF-8')) {
        req.headers['content-type'] = req.headers['content-type'].replace(
          'UTF-8',
          'utf-8',
        );
      }
      next();
    });
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up
    await prisma.post.deleteMany({
      where: { user: { email: { in: [testUser.email, otherUser.email] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, otherUser.email] } },
    });

    // Register & Login Test User
    const res1 = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);
    if (res1.status !== 201)
      throw new Error(`Registration failed: ${res1.status}`);
    token = res1.body.accessToken;

    // Register & Login Other User
    const res2 = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(otherUser);
    if (res2.status !== 201)
      throw new Error(`Registration 2 failed: ${res2.status}`);
    otherToken = res2.body.accessToken;
  }, 45000);

  afterAll(async () => {
    if (prisma) {
      await prisma.post.deleteMany({
        where: { user: { email: { in: [testUser.email, otherUser.email] } } },
      });
      await prisma.user.deleteMany({
        where: { email: { in: [testUser.email, otherUser.email] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('/posts (POST)', () => {
    it('should create a new post', () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My First Post',
          content: 'Hello World',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.title).toBe('My First Post');
          postId = res.body.id;
        });
    });

    it('should fail to create post without auth', () => {
      return request(app.getHttpServer())
        .post('/api/posts')
        .send({ title: 'Fail', content: 'Fail' })
        .expect(401);
    });
  });

  describe('/posts (GET)', () => {
    it('should return all posts', () => {
      return request(app.getHttpServer())
        .get('/api/posts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('/posts/me (GET)', () => {
    it('should return my posts', () => {
      return request(app.getHttpServer())
        .get('/api/posts/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body[0].id).toBe(postId);
        });
    });
  });

  describe('/posts/:id (PATCH)', () => {
    it('should allow owner to update post', () => {
      return request(app.getHttpServer())
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Title');
        });
    });

    it('should forbid other user from updating post', () => {
      return request(app.getHttpServer())
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Malicious Update' })
        .expect(403);
    });
  });

  describe('/posts/:id (DELETE)', () => {
    it('should forbid other user from deleting post', () => {
      return request(app.getHttpServer())
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    it('should allow owner to delete post', () => {
      return request(app.getHttpServer())
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
