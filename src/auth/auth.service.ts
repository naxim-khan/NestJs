import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { sanitizeUser, comparePassword } from 'src/users/utils/user.utils';
import { LoginDto } from './dto/login.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService
    ) { }

    // register method
    async registerUser(createUserDto: CreateUserDto) {
        const user = await this.userService.createRaw(createUserDto); // returns raw mongoose doc
        const accessToken = await this.jwtService.signAsync(
            { sub: user._id.toString(), email: user.email, role: user.role }
        );

        return {
            accessToken,
            user: sanitizeUser(user),
        };
    }


    // login method
    async loginUser(loginDto: LoginDto) {
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordMatching = await comparePassword(loginDto.password, user.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const accessToken = await this.jwtService.signAsync(
            { sub: user._id.toString(), email: user.email, role: user.role }
        );
        return {
            accessToken,
            user: sanitizeUser(user),
        };
    }

    // get profile method
    async getProfile(userId: string) {
        return await this.userService.findOne(userId);
    }

    // logout method
    async logoutUser(token: string) {
        this.tokenBlacklistService.add(token);
        return 'User logged out successfully';
    }
}
