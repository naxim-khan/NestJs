import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { sanitizeUser, hashPassword } from './utils/user.utils';
import { successResponse } from './utils/response.utils';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    //  Raw user creation method for AuthService only
    async createRaw(createUserDto: CreateUserDto): Promise<UserDocument> {
        try {
            const hashed = await hashPassword(createUserDto.password);
            const newUser = new this.userModel({
                ...createUserDto,
                password: hashed,
            });
            await newUser.save();
            return newUser;
        } catch (error) {
            if (error.code === 11000) {
                throw new BadRequestException('User with this email already exists');
            }
            throw error;
        }
    }


    async create(createUserDto: CreateUserDto) {
        try {
            const hashed = await hashPassword(createUserDto.password);
            const newUser = new this.userModel({ ...createUserDto, password: hashed });
            await newUser.save();

            return newUser;
        } catch (error) {
            if (error.code === 11000) {
                throw new BadRequestException('User with this email already exists');
            }
            throw error;
        }
    }

    async findAll() {
        const users = await this.userModel.find();
        return users.map(u => sanitizeUser(u));
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findOne(id: string) {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException(`User with id ${id} not found`);
        return sanitizeUser(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException(`User with id ${id} not found`);

        if (updateUserDto.password) {
            updateUserDto.password = await hashPassword(updateUserDto.password);
        }

        // 🛡️ Safe merge: only update fields that are actually provided
        Object.keys(updateUserDto).forEach(key => {
            if (updateUserDto[key] !== undefined) {
                user[key] = updateUserDto[key];
            }
        });

        await user.save();

        return sanitizeUser(user);
    }

    async remove(id: string) {
        const user = await this.userModel.findByIdAndDelete(id);
        if (!user) throw new NotFoundException(`User with id ${id} not found`);
        return sanitizeUser(user);
    }
}
