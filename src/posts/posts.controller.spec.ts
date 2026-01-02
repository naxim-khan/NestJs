import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Role } from '@prisma/client';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    content: 'Test Content',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findMyPosts: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      sub: 'user-1',
      role: Role.USER,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const dto = { title: 'Test Post', content: 'Test Content' };
      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(dto, mockRequest);

      expect(result).toEqual(mockPost);
      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [mockPost];
      mockPostsService.findAll.mockResolvedValue(posts);

      const result = await controller.findAll();

      expect(result).toEqual(posts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findMyPosts', () => {
    it('should return my posts', async () => {
      const posts = [mockPost];
      mockPostsService.findMyPosts.mockResolvedValue(posts);

      const result = await controller.findMyPosts(mockRequest);

      expect(result).toEqual(posts);
      expect(service.findMyPosts).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findOne', () => {
    it('should return one post', async () => {
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne('post-1');

      expect(result).toEqual(mockPost);
      expect(service.findOne).toHaveBeenCalledWith('post-1');
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const dto = { title: 'Updated' };
      mockPostsService.update.mockResolvedValue({ ...mockPost, ...dto });

      const result = await controller.update('post-1', dto, mockRequest);

      expect(result.title).toEqual('Updated');
      expect(service.update).toHaveBeenCalledWith(
        'post-1',
        dto,
        mockRequest.user,
      );
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      mockPostsService.remove.mockResolvedValue(mockPost);

      const result = await controller.remove('post-1', mockRequest);

      expect(result).toEqual(mockPost);
      expect(service.remove).toHaveBeenCalledWith('post-1', mockRequest.user);
    });
  });
});
