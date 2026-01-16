import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Importujemy typ User
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Używamy DTO zamiast (username, pass)
  async signIn(signUpDto: SignUpDto): Promise<{ access_token: string }> {
    const { username, password } = signUpDto;

    // findOne zwraca Promise<User | undefined>
    const user = await this.usersService.findOne(username);

    // TypeScript: user może być undefined, więc używamy Optional Chaining (?.)
    // lub sprawdzamy istnienie usera w warunku.
    if (!user || !user.password) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    // Porównujemy hasło podane z hashem w bazie
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Rejestracja zwraca zazwyczaj Promise<void> lub utworzonego użytkownika
  async signUp(signInDto: SignInDto): Promise<void> {
    const { username, password } = signInDto;

    // 1. Generujemy sól
    const salt = await bcrypt.genSalt();
    // 2. Haszujemy hasło z solą
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Przekazujemy hash do serwisu użytkowników
    await this.usersService.create(username, hashedPassword);
  }
}
