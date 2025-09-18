import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ActionType, ComponentType } from 'generated/prisma';

export class FilterLogsDto {
  @IsNotEmpty()
  @IsEnum(ActionType)
  action?: ActionType;

  @IsNotEmpty()
  @IsEnum(ComponentType)
  component?: ComponentType;

  @IsOptional()
  @IsString()
  newValue?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
