import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: {
        ...createPostDto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findMyPosts(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    user: { sub: string; role: string },
  ) {
    const post = await this.findOne(id);

    // Ownership check: Admin can update anything, User can only update their own
    if (user.role !== Role.ADMIN && post.userId !== user.sub) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: string, user: { sub: string; role: string }) {
    const post = await this.findOne(id);

    // Ownership check
    if (user.role !== Role.ADMIN && post.userId !== user.sub) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }
}
