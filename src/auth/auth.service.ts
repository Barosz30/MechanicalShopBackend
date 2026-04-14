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
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
// Jeśli masz wyeksportowaną klasę/interfejs User, warto go tu zaimportować
// import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private mailTransporter: Transporter | null = null;

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

  private getMailer(): Transporter | null {
    if (this.mailTransporter) {
      return this.mailTransporter;
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      return null;
    }

    this.mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    return this.mailTransporter;
  }

  private getFrontendBaseUrl(): string {
    const fromFrontendEnv = process.env.FRONTEND_URL?.trim();
    const fromCorsEnv = process.env.CORS_ORIGIN?.split(',')
      .map((v) => v.trim())
      .filter(Boolean)[0];
    return fromFrontendEnv || fromCorsEnv || 'http://localhost:4200';
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

  async changePassword(
    userId: number,
    username: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findOne(username);

    if (!user || user.id !== userId || !user.password) {
      throw new UnauthorizedException('Użytkownik nie został odnaleziony');
    }

    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Aktualne hasło jest nieprawidłowe');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);
    await this.usersService.updatePassword(userId, hashedPassword);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findOne(dto.username);

    if (!user) {
      return { message: 'Jeżeli konto istnieje, link resetu został wysłany.' };
    }

    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
        purpose: 'password-reset',
      },
      { expiresIn: '15m' },
    );

    const frontendUrl = this.getFrontendBaseUrl();
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@localhost';
    const transporter = this.getMailer();

    try {
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to: user.username,
          subject: 'Reset hasla - Mechanical Shop',
          text: `Aby ustawic nowe haslo, wejdz w link: ${resetUrl}. Link wygasa za 15 minut.`,
          html: `<p>Aby ustawić nowe hasło, kliknij link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link wygasa za 15 minut.</p>`,
        });
      } else {
        console.warn('SMTP is not configured. Reset link:', resetUrl);
      }
    } catch (error) {
      console.error('Failed to send reset password email:', error);
    }

    return { message: 'Jeżeli konto istnieje, link resetu został wysłany.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    try {
      const secret = process.env.SECRET_KEY;
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        username: string;
        purpose: string;
      }>(dto.token, { secret });

      if (payload.purpose !== 'password-reset') {
        throw new UnauthorizedException('Nieprawidłowy token resetu hasła');
      }

      const user = await this.usersService.findOne(payload.username);
      if (!user || user.id !== payload.sub) {
        throw new UnauthorizedException('Nieprawidłowy token resetu hasła');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(dto.newPassword, salt);
      await this.usersService.updatePassword(user.id, hashedPassword);
    } catch {
      throw new UnauthorizedException('Nieprawidłowy token resetu hasła');
    }
  }
}
