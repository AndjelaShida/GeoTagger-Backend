import { IsString, MinLength } from "class-validator";

export class UserLoginDto {
  @IsString()
  usernameOrEmail: string; 
  @IsString()
  @MinLength(6)
  password: string;
}
