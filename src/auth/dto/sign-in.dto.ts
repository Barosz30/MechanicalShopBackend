import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'ash',
    description: 'Login użytkownika',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'Andrzej123!',
    description: 'Hasło użytkownika',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
