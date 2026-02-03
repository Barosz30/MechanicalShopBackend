import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: jest.fn().mockReturnValue({
            email: 'test@example.com',
            sub: '123456',
          }),
        }),
      };
    }),
  };
});

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    sign: jest.fn(),
  };

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access token on successful login', async () => {
    const mockUser = {
      id: 1,
      username: 'test@test.pl',
      password: 'hashedPassword',
    };

    mockUsersService.findOne.mockResolvedValue(mockUser);
    mockJwtService.signAsync.mockResolvedValue('fake_token');

    const result = await service.googleLogin('fake_google_token');

    expect(result).toHaveProperty('access_token');
    expect(mockUsersService.findOne).toHaveBeenCalledWith('test@example.com');
  });
});
