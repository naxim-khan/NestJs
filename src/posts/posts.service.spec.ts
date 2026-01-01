import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  const mockUser = { id: 'user-1', name: 'Owner', email: 'owner@test.com' };
  const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    content: 'Test Content',
    userId: 'user-1',
    user: mockUser,
  };

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const dto = { title: 'Test', content: 'Content' };
      mockPrismaService.post.create.mockResolvedValue({ ...dto, id: '1', userId: 'user-1' });

      const result = await service.create(dto, 'user-1');

      expect(result.userId).toEqual('user-1');
      expect(prisma.post.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all posts with user info', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([mockPost]);

      const result = await service.findAll();

      expect(result).toEqual([mockPost]);
      expect(prisma.post.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a post if it exists', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne('post-1');

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne('post-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Updated' };
    const ownerUser = { sub: 'user-1', role: Role.USER };
    const adminUser = { sub: 'admin-1', role: Role.ADMIN };
    const otherUser = { sub: 'user-2', role: Role.USER };

    it('should allow owner to update', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue({ ...mockPost, ...updateDto });

      const result = await service.update('post-1', updateDto, ownerUser);

      expect(result.title).toEqual('Updated');
    });

    it('should allow admin to update', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.update.mockResolvedValue({ ...mockPost, ...updateDto });

      const result = await service.update('post-1', updateDto, adminUser);

      expect(result.title).toEqual('Updated');
    });

    it('should throw ForbiddenException for non-owner/non-admin', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(service.update('post-1', updateDto, otherUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const ownerUser = { sub: 'user-1', role: Role.USER };
    const adminUser = { sub: 'admin-1', role: Role.ADMIN };
    const otherUser = { sub: 'user-2', role: Role.USER };

    it('should allow owner to delete', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove('post-1', ownerUser);

      expect(result).toEqual(mockPost);
    });

    it('should allow admin to delete', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove('post-1', adminUser);

      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException for non-owner/non-admin', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(service.remove('post-1', otherUser)).rejects.toThrow(ForbiddenException);
    });
  });
});
