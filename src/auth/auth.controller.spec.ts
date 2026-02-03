import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthenticatedRequest } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    googleLogin: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(() => 'test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp with correct dto', async () => {
      const dto: SignUpDto = {
        username: 'test@test.pl',
        password: 'password123',
      };
      mockAuthService.signUp.mockResolvedValue(undefined);
      await controller.signUp(dto);
      expect(mockAuthService.signUp).toHaveBeenCalledWith(dto);
    });
  });

  describe('signIn', () => {
    it('should return access token', async () => {
      const dto: SignInDto = {
        username: 'test@test.pl',
        password: 'password123',
      };
      const resultToken = { access_token: 'fake_jwt_token' };
      mockAuthService.signIn.mockResolvedValue(resultToken);
      const result = await controller.signIn(dto);
      expect(result).toEqual(resultToken);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(dto);
    });
  });

  describe('googleAuth', () => {
    it('should call googleLogin with token string', async () => {
      const googleDto = { token: 'google_id_token_xyz' };
      const resultToken = { access_token: 'our_app_token' };
      mockAuthService.googleLogin.mockResolvedValue(resultToken);
      const result = await controller.googleAuth(googleDto);
      expect(result).toEqual(resultToken);
      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(googleDto.token);
    });
  });

  describe('getProfile', () => {
    it('should return user from request object', () => {
      const mockRequest = {
        user: { sub: 1, username: 'test@test.pl' },
      } as unknown as AuthenticatedRequest;
      const result = controller.getProfile(mockRequest);
      expect(result).toEqual(mockRequest.user);
    });
  });
});
