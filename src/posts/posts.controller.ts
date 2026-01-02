import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import * as RequestTypes from 'src/common/types/request.types';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: RequestTypes.AuthenticatedRequest) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'List of posts' })
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my posts' })
  @ApiResponse({ status: 200, description: 'List of my posts' })
  @UseGuards(AuthGuard)
  @Get('me')
  findMyPosts(@Req() req: RequestTypes.AuthenticatedRequest) {
    return this.postsService.findMyPosts(req.user.sub);
  }

  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({ status: 200, description: 'Post details' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req: RequestTypes.AuthenticatedRequest) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestTypes.AuthenticatedRequest) {
    return this.postsService.remove(id, req.user);
  }
}
