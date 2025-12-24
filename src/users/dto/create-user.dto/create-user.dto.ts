import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../../types/user.types';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  role?: Role = Role.USER;

  @IsString()
  password: string;
}
