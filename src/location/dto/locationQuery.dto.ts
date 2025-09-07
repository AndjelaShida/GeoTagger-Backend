//dto koji radi sa svim query upitima za location
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class LocationQueryDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  latitude: number; 

  @IsOptional()
  longitude: number;

  @IsOptional()
  @IsString()
  imageUrl: string;

  @IsOptional()
  createdAt: Date;

  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Min(0)
  offset: number;
}
