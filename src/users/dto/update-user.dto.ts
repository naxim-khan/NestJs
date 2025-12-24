import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../types/user.types';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

//   @IsOptional() 
//   @IsEmail()
//   email?: string;
// i commented out email to prevent update of email field.

  @IsOptional()
  @IsString()
  role?: Role;

  @IsOptional()
  @IsString()
  password?: string;
}
