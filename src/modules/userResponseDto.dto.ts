export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}
