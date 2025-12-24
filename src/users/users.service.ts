import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from '@prisma/client';
import { sanitizeUser, hashPassword } from './utils/user.utils';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    // Raw user creation method for AuthService only
    async createRaw(createUserDto: CreateUserDto | AdminCreateUserDto): Promise<User> {

        try {
            const hashed = await hashPassword(createUserDto.password);
            return await this.prisma.user.create({
                data: {
                    ...createUserDto,
                    password: hashed,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new BadRequestException('User with this email already exists');
            }
            throw error;
        }
    }

    async create(createUserDto: CreateUserDto | AdminCreateUserDto) {

        try {
            const data: any = { ...createUserDto };
            if (data.role) {
                data.role = data.role.toUpperCase();
            }
            const hashed = await hashPassword(data.password);
            const user = await this.prisma.user.create({
                data: {
                    ...data,
                    password: hashed,
                },
            });
            return sanitizeUser(user);

        } catch (error) {
            if (error.code === 'P2002') {
                throw new BadRequestException('User with this email already exists');
            }
            throw error;
        }
    }

    async findAll() {
        const users = await this.prisma.user.findMany();
        return users.map(u => sanitizeUser(u));
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) throw new NotFoundException(`User with id ${id} not found`);
        return sanitizeUser(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException(`User with id ${id} not found`);

        // Explicitly prevent role updates in regular update method
        const { name, password } = updateUserDto;
        const data: any = {};

        if (name !== undefined) data.name = name;
        if (password) data.password = await hashPassword(password);

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
        });

        return sanitizeUser(updatedUser);
    }

    // Admin-only update method that can modify all fields including role
    async adminUpdate(id: string, updateUserDto: any) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException(`User with id ${id} not found`);

        const data: any = {};
        const allowedFields = ['name', 'email', 'password', 'role'];

        // Only include allowed fields from the DTO
        for (const field of allowedFields) {
            if (updateUserDto[field] !== undefined) {
                if (field === 'role' && typeof updateUserDto[field] === 'string') {
                    data[field] = updateUserDto[field].toUpperCase();
                } else {
                    data[field] = updateUserDto[field];
                }
            }
        }


        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data,
        });

        return sanitizeUser(updatedUser);
    }


    async remove(id: string) {
        try {
            const user = await this.prisma.user.delete({
                where: { id },
            });
            return sanitizeUser(user);
        } catch (error) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
    }
}
