//dto koji radi sa svim query upitima za location
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class LocationQueryDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  latitude: string; //PROMENI U FLOAT

  @IsOptional()
  @IsString()
  longitude: string;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  createdAt: Date;

  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Min(0)
  offset: number;
}
