
import { IsString, IsEmail, MinLength } from 'class-validator';

export class ValidateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}