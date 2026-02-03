import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { OAuth2Client } from 'google-auth-library';
// Jeśli masz wyeksportowaną klasę/interfejs User, warto go tu zaimportować
// import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { username, password } = signInDto;
    const user = await this.usersService.findOne(username);

    // Sprawdzamy usera i hasło
    if (!user || !user.password) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    // POPRAWKA 1: Używamy metody pomocniczej zamiast kopiować kod
    return this.generateJwt(user);
  }

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const { username, password } = signUpDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.usersService.create(username, hashedPassword);
  }

  private async generateJwt(user: { id: number; username: string }) {
    const payload = {
      sub: user.id,
      username: user.username,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      return ticket.getPayload();
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Błąd weryfikacji tokena Google');
    }
  }

  async googleLogin(token: string) {
    const googlePayload = await this.verifyGoogleToken(token);

    if (!googlePayload || !googlePayload.email) {
      throw new BadRequestException('Token Google nie zawiera adresu email');
    }

    const email = googlePayload.email;

    let user = await this.usersService.findOne(email);

    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      await this.usersService.create(email, hashedPassword);

      user = await this.usersService.findOne(email);
    }

    if (!user) {
      throw new InternalServerErrorException(
        'Błąd podczas tworzenia użytkownika',
      );
    }

    return this.generateJwt(user);
  }
}
