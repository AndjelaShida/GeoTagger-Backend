import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionType } from 'generated/prisma';

export class ActionTypeDto {
  @IsNotEmpty()
  @IsEnum(ActionType)
  action: ActionType;
}
