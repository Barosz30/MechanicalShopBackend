import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from './auth.guard';
import type { AuthenticatedRequest } from './auth.guard';
import { IsNotEmpty, IsString } from 'class-validator';

class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZm...',
    description: 'Token ID otrzymany od Google (client-side)',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Rejestracja nowego użytkownika' })
  @ApiResponse({
    status: 201,
    description: 'Użytkownik został pomyślnie utworzony.',
  })
  @ApiResponse({
    status: 400,
    description: 'Błędne dane (np. hasło za krótkie).',
  })
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: 'Logowanie użytkownika (Email/Hasło)' })
  @ApiResponse({ status: 200, description: 'Zwraca access_token JWT.' })
  @ApiResponse({ status: 401, description: 'Błędny login lub hasło.' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @ApiOperation({ summary: 'Logowanie przez Google' })
  @ApiResponse({
    status: 200,
    description: 'Weryfikuje token Google i zwraca Twój access_token JWT.',
  })
  @ApiResponse({ status: 401, description: 'Nieprawidłowy token Google.' })
  @HttpCode(HttpStatus.OK)
  @Post('google')
  async googleAuth(@Body() googleDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleDto.token);
  }

  @ApiOperation({ summary: 'Rozpocznij proces resetu hasła' })
  @ApiResponse({
    status: 200,
    description: 'Zwraca komunikat i wysyła link resetu na email.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiOperation({ summary: 'Ustaw nowe hasło na podstawie tokenu resetu' })
  @ApiResponse({
    status: 200,
    description: 'Hasło zostało zresetowane.',
  })
  @ApiResponse({
    status: 401,
    description: 'Nieprawidłowy lub wygasły token resetu.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Hasło zostało zresetowane' };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pobierz profil (wymaga JWT)' })
  @ApiResponse({
    status: 200,
    description: 'Zwraca dane zalogowanego użytkownika.',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak tokena lub token nieprawidłowy.',
  })
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Zmiana hasła zalogowanego użytkownika' })
  @ApiResponse({
    status: 200,
    description: 'Hasło zostało zmienione.',
  })
  @ApiResponse({
    status: 401,
    description: 'Brak tokena lub nieprawidłowe aktualne hasło.',
  })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    await this.authService.changePassword(
      user.sub,
      user.username,
      changePasswordDto,
    );
    return { message: 'Hasło zostało zmienione' };
  }
}
