import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './auth.guard';
import { SignUpDto } from './dto/sign-up.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Rejestracja nowego użytkownika' }) // Opis endpointu
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

  @ApiOperation({ summary: 'Logowanie użytkownika' })
  @ApiResponse({ status: 200, description: 'Zwraca access_token JWT.' })
  @ApiResponse({ status: 401, description: 'Błędny login lub hasło.' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
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
  getProfile(@Request() req) {
    return req.user;
  }
}
