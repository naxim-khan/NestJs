import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Max 3 registration attempts per minute
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Max 5 login attempts per minute
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.loginUser(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    return this.authService.logoutUser(req.accessToken);
  }
}
