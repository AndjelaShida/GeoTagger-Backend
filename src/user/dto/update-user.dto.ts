import { IsString, IsEmail, MinLength, IsOptional, IsInt, IsDate } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsInt()
  points?: number;

  @IsOptional()
  @IsDate()
  resetTokenExpiry?: Date;

  @IsOptional()
  @IsString()
  resetToken?: string;

  // createdAt i updatedAt obično update-uje Prisma automatski
}
