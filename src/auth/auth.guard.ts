import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
export interface JwtPayload {
  sub: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const secret = this.configService.get<string>('SECRET_KEY');

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: secret,
      });

      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private getRequest(context: ExecutionContext): AuthenticatedRequest {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest<AuthenticatedRequest>();
    }

    const ctx = GqlExecutionContext.create(context);

    const gqlContext = ctx.getContext<{ req: AuthenticatedRequest }>();

    return gqlContext.req;
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
