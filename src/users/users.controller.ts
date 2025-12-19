import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { UsersService, ResponseWithUser, User } from './users.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


// i use async awaits for future DB connection so these are useless for now but will work in future.
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
        return await this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(): Promise<Omit<User, 'password'>[]> {
        return await this.usersService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Omit<User, 'password'>> {
        return await this.usersService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<ResponseWithUser> {
        return await this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<ResponseWithUser> {
        return await this.usersService.remove(id);
    }
}
