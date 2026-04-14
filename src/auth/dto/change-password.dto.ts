import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'StareHaslo123!',
    description: 'Aktualne hasło użytkownika',
  })
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @ApiProperty({
    example: 'NoweHaslo123!',
    description: 'Nowe hasło użytkownika',
  })
  @IsString()
  @MinLength(8, { message: 'Hasło musi mieć minimum 8 znaków' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Hasło jest za słabe (musi zawierać dużą literę, małą literę i cyfrę)',
  })
  newPassword: string;
}
