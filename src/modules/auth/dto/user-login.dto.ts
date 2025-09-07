import { IsString, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
