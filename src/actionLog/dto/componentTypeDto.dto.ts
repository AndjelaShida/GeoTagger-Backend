import { IsEnum, IsNotEmpty } from 'class-validator';
import { ComponentType } from 'generated/prisma';

export class ComponentTypeDto {
  @IsNotEmpty()
  @IsEnum(ComponentType)
  component: ComponentType;
}
