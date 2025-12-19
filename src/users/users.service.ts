import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// i use async awaits for future DB connection so these are useless for now but will work in future.
export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
}

export interface ResponseWithUser {
    message: string;
    user: Omit<User, 'password'>;
}

// dummy data array
let users: User[] = [
    {
        id: 1,
        name: "Nazeem",
        email: "nazeem@gmail.com",
        password: "22522"
    }
];

@Injectable()
export class UsersService {
    // sanitization
    private sanitize(user: User) {
        const { password, ...rest } = user;
        return rest;
    }

    // find user index
    private findUserIndex(id: number): number {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return index;
    }

    // create new user
    async create(createUserDto: CreateUserDto) {
        const userExists = users.find(u => u.email === createUserDto.email);
        if (userExists) throw new BadRequestException("User with this email already exists");

        const newId = Date.now();
        const newUser: User = { ...createUserDto, id: newId, password: createUserDto.password };
        users.push(newUser);

        return this.sanitize(newUser);
    }

    // get all users
    findAll() {
        return users.map(user => this.sanitize(user));
    }

    // get user by id
    findOne(id: number) {
        const user = users.find(u => u.id === id);
        if (!user) throw new NotFoundException(`User with id ${id} not found`);
        return this.sanitize(user);
    }

    // update user
    update(id: number, updateUserDto: UpdateUserDto): ResponseWithUser {
        const userIndex = this.findUserIndex(id);
        const updatedUser: User = { ...users[userIndex], ...updateUserDto };
        users[userIndex] = updatedUser;

        return { message: `User with id ${id} updated successfully`, user: this.sanitize(updatedUser) };
    }

    // delete user
    remove(id: number): ResponseWithUser {
        const userIndex = this.findUserIndex(id);
        const [deletedUser] = users.splice(userIndex, 1);

        return { message: `User with id ${id} deleted successfully`, user: this.sanitize(deletedUser) };
    }
}
