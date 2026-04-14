import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Login użytkownika (email)',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}
